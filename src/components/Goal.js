import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";

const Box = styled.div`
  padding: 5px;
`;

const List = styled.dl`
  margin: 0;
  padding: 0;
`;

const Title = styled.dt`
  text-align: "left";
  display: "block";
  color: #999;
  padding: 0;
  margin: 0.1em 0;
  font-size: 80%;
`;

const Definition = styled.dd`
  text-align: "left";
  display: "block";
  font-size: 110%;
  padding: 0;
  margin: 0 0 0.5em 0;
`;

export default ({ patient, client }) => {
  const [goal, setGoal] = useState();
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const goalBundle = await client.request(
          `Goal?subject=${patient?.id}&_sort=-start-date&_count=1`
        );
        setGoal(goalBundle?.entry[0]?.resource);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, [client, patient]);

  const onNewGoal = async (data) => {
    console.log(data);
    const resource = {
      resourceType: "Goal",
      description: {
        text: "Steps goal."
      },
      lifecycleStatus: "active",
      target: [
        {
          measure: {
            coding: [
              {
                system: "http://loinc.org",
                code: "41950-7",
                display: "Number of steps in 24 hour Measured"
              }
            ]
          },
          detailInteger: data.stepCount,
          dueDate: "2020-12-25"
        }
      ],
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/goal-category",
              code: "physiotherapy"
            }
          ]
        }
      ],
      subject: {
        reference: `Patient/${patient?.id}`,
        display: `${patient?.name[0].given[0]} ${patient?.name[0].family}`
      },
      startDate: new Date()
    };

    const req = await client
      .request({
        url: "Goal",
        method: "POST",
        body: JSON.stringify(resource),
        headers: {
          "Content-Type": "application/fhir+json"
        }
      })
      .catch((e) => console.error(e));
    console.log(req);
    setGoal(req);
  };

  return (
    <>
      <Box>
        <h2 style={{ width: "100%", margin: 0 }}>Goal</h2>
      </Box>
      {goal ? (
        <Box>
          <List>
            <Title>Start Date</Title>
            <Definition>{goal?.startDate}</Definition>

            <Title>Target Number of Steps per Day</Title>
            <Definition>{goal?.target[0]?.detailInteger}</Definition>
          </List>
        </Box>
      ) : null}
      <Box>
        <form id="goal-form" onSubmit={handleSubmit(onNewGoal)}>
          <label>New Goal daily Steps:</label>
          <input
            placeholder="Step Count Goal"
            ref={register}
            name="stepCount"
          />

          <div>
            <button type="submit" form="goal-form">
              Submit
            </button>
          </div>
        </form>
      </Box>
    </>
  );
};
