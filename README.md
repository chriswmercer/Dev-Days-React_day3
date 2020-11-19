# Building SMART Apps with React

The goal of this project is to teach you how to use React in conjunction with the SMART Auth flow, and how to render FHIR Resources

Consider using a Markdown Viewer to read this file such as https://dillinger.io/

## Getting Started

Today we will build a FHIR App that creates Goals and Observations in order to promote a healthy number of daily steps to strive for.

## 1. Fork this Project by clicking the Fork button in the top right.

## 2. Update your launch.html

Open up the file `public/launch.html` and set your redirectUri to the URL provided by codesandbox on the right hand side.

## 3. Simulate an EHR Launch by clicking "Simulate EHR Launch" in Quick Links

If things are working correctly, you should see a TextArea containing your SMART context information. Most importantly, you should see an access_token. We can use this to request or create Resources.

## 4. Request the Patient Resource

The Patient Resource should be displayed on your app. You can request it by using `useEffect` within your `App.js`

Try modifying your `useEffect` to be like the code snippet below:

```
useEffect(() => {
  const fetchData = async () => {
    try {
      const client = await connect();

      setClient(client);

      /* Fetch the Patient and other resources here using FhirClient */

      const patient = await client.request(`Patient/${client.patient.id}`);

      /* use setState to store it in the component state */

      setPatient(patient);
    } catch (e) {
      console.log(e);
    }
  };
  fetchData();
}, []);
```

You can display the Patient on the screen by modifying the return value of `App.js`. Don't forget to store the patient in State using `setState`.

```
return (
  <textarea
    rows={30}
    style={{ width: '100%' }}
    value={JSON.stringify(goal, null, 2)}
    disabled
  />
)
```

## 5. Create a goal

Let's create a Goal to do 10,000 daily steps. An example of this Goal can be found in `example_resources`.

You can use `fhirclient` to send requests.

```
  const onClick = async () => {
    const resource = {
      resourceType: "Goal",
      text: {
        status: "additional",
        div:
          '<div xmlns="http://www.w3.org/1999/xhtml"><p> A goal to do 8000-10000 steps a day</p></div>',
      },
      description: {
        text: description,
      },
      lifecycleStatus: "active",
      target: [
        {
          measure: {
            coding: [
              {
                system: "http://loinc.org",
                code: "41950-7",
                display: "Number of steps in 24 hour Measured",
              },
            ],
          },
          detailInter: 10000,
          dueDate: "2020-12-25",
        },
      ],
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/goal-category",
              code: "physiotherapy",
            },
          ],
        },
      ],
      subject: {
        reference: `Patient/${patient?.id}`,
        display: `${patient?.name[0].given[0]} ${patient?.name[0].family}`,
      },
      startDate: new Date(),
    };

    const req = await client.request({
      url: "Goal",
      method: "POST",
      body: JSON.stringify(resource),
      headers: {
        "Content-Type": "application/fhir+json",
      },
    });
    setGoal(req);
  };
```

Include a button for the User

```
// In the return value of `App.js`
<button onClick={onClick}>Create a Goal</button>
{goal ? (
  <textarea
    rows={30}
    style={{ width: "100%" }}
    value={JSON.stringify(patient, null, 2)}
    disabled
  />
) : null}
```

Feel free to get creative with what this looks like to the User

## 6. Create Observations

Like with Goals, we can create Observations in order to show our progress towards a healthy lifestyle. An example of an Observation can be found in `example_resources`

```
// in the `App` function
const [observation, setObservation] = useState();
const { register, watch, handleSubmit } = useForm();
const { stepCount } = watch();

const onClickObservation = async () => {
  const resource = {
    resourceType: "Observation",
    text: {
      status: "generated",
      div:
        '<div xmlns="http://www.w3.org/1999/xhtml"><p>Number of steps in 24 hr</p></div>',
    },
    status: "final",
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "41950-7",
          display: "Number of steps in 24 hour Measured",
        },
      ],
    },
    subject: {
      reference: `Patient/${patient.id}`,
      display: "Abby Smith",
    },
    effectivePeriod: {
      start: "2013-04-02T09:30:10+01:00",
    },
    issued: "2020-11-16T22:11:57.900Z",
    valueInteger: 10000,
  };
  const res = await client.request({
    url: "Observation",
    method: "POST",
    body: JSON.stringify(resource),
    headers: {
      "Content-Type": "application/fhir+json",
    },
  });
  setObservation(res);
};
```

Include a form for the User

```
// In the return value of `App.js`
<form
  id="observation-form"
  onSubmit={handleSubmit(onClickObservation)}
>
  <label>Create an Observation:</label>
  <input
    placeholder="Step Count for today"
    ref={register}
    name="stepCount"
  ></input>
</form>
<div>
  <button form="observation-form">Submit</button>
</div>
<textarea
  style={{
    width: "100%"
  }}
  rows={25}
  value={JSON.stringify(observation, null, 2)}
  disabled
/>
```

## 7. Read Observations

We can read a patient's Observations back to track our progress.

```
const [observations, setObservations] = useState()

useEffect(() => {
  const fetchData = async () => {
    try {
      const client = await connect();

      setClient(client);

      /* Fetch the Patient and other resources here using FhirClient */

      const patient = await client.request(`Patient/${client.patient.id}`);

      /* use setState to store it in the component state */

      setPatient(patient);

      const obs = await client.request(`Observation/?patient=${patient.id}&code=http://loinc.org|41950-7`);
      setObservations(obs);
    } catch (e) {
      console.log(e);
    }
  };
  fetchData();
}, []);
```
