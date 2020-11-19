import React, { useEffect, useState } from "react";
import styled from "styled-components";
import connect from "../services/FhirClient";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { useForm } from "react-hook-form";

import Patient from "./Patient";
import Goal from "./Goal";

/**
 * Use Styled-components to create easy styling
 * https://github.com/styled-components/styled-components
 */
const Container = styled.div`
  margin: 2rem;
  justify-content: center;
  font-family: sans-serif;
`;

const Box = styled.div`
  display: block;
  padding: 5px;
  border-top: 1px solid #ddd;
`;

/**
 * Functional components return JSX to render.
 */
function App() {
  const [client, setClient] = useState({});
  const [patient, setPatient] = useState();
  const { register, handleSubmit } = useForm();
  const [observations, setObservations] = useState();

  const onClickObservation = async (data) => {
    const resource = {
      resourceType: "Observation",
      status: "final",
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "41950-7"
          }
        ]
      },
      subject: {
        reference: `Patient/${patient.id}`,
        display: `${patient?.name[0]?.given} ${patient?.name[0]?.family}`
      },
      effectiveDateTime: new Date().toISOString().slice(0, 10),
      valueInteger: data.stepCount
    };
    await client.request({
      url: "Observation",
      method: "POST",
      body: JSON.stringify(resource),
      headers: {
        "Content-Type": "application/fhir+json"
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = await connect();
        setClient(client);
        // console.log(JSON.stringify(client));

        const patient = await client.request(`Patient/${client.patient.id}`);
        setPatient(patient);

        const goalBundle = await client.request(
          `Goal?subject=${patient?.id}&_sort=-start-date&_count=1`
        );
        console.log(goalBundle);

        const obsBundle = await client.request(
          `Observation/?patient=${patient.id}&code=http://loinc.org|41950-7&_sort=date`
        );
        console.log(obsBundle);

        const observations = obsBundle.entry.map(
          ({ resource: observation }) => {
            const [month, date, year] = new Date(observation.effectiveDateTime)
              .toLocaleDateString("en-US")
              .split("/");
            return {
              name: `${month}-${date}`,
              steps: observation.valueInteger,
              goal: goalBundle?.entry[0]?.resource?.target[0]?.detailInteger
            };
          }
        );
        console.log(observations);
        setObservations(observations);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Container>
        <Box>
          <Patient patient={patient} />
        </Box>

        <Box>
          <Goal patient={patient} client={client} />
        </Box>

        <Box>
          <h2>Log Today's Steps</h2>
          <form
            id="observation-form"
            onSubmit={handleSubmit(onClickObservation)}
          >
            <label>Create Observation:</label>
            <input
              placeholder="Step Count for today"
              ref={register}
              name="stepCount"
            />
            <div>
              <button type="submit" form="observation-form">
                Submit
              </button>
            </div>
          </form>
        </Box>
        <ComposedChart
          width={500}
          height={400}
          data={observations}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="goal"
            fill="#8884d8"
            stroke="#8884d8"
          />
          <Bar dataKey="steps" barSize={20} fill="#413ea0" />
          {/* <Scatter dataKey="cnt" fill="red" /> */}
        </ComposedChart>
      </Container>
    </>
  );
}

export default App;
