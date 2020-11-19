import React from "react";
import styled from "styled-components";

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

export default ({ patient }) => {
  return (
    <>
      {patient ? (
        <Box>
          <h2>Patient</h2>
          <List>
            <Title>Name</Title>
            <Definition>
              {patient.name[0]?.given} {patient.name[0]?.family}
            </Definition>

            <Title>DOB</Title>
            <Definition>{patient.birthDate}</Definition>
          </List>
        </Box>
      ) : (
        <Box>
          <a href="launch.html?launch=eyJhIjoiMSIsImYiOiIxIn0&iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir">
            Simulate EHR Launch
          </a>
        </Box>
      )}
    </>
  );
};
