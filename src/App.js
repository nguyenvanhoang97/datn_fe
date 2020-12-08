import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import moment from "moment";
import { Row, Col, Button } from 'reactstrap';
import { Line } from "react-chartjs-2";

function App() {
  const [status, setStatus] = useState(true);
  const [statusMotor, setStatusMotor] = useState('MOTOR_OFF');
  const [state, setState] = useState({
    humi: '',
    temp: '',
    soil: ''
  });
  const [stateChart, setStateChart] = useState({
    dateChart: [],
    tempChart: [],
    humiChart: [],
  });

  const getData = () => {
    const interval = setInterval(() => {
      axios.get('http://localhost:3001/')
        .then(res => {
          if (res.status === 200) {
            setState({
              humi: res.data.humi,
              temp: res.data.temp,
              soil: res.data.soil
            })
            if (moment(Date.now()).format('mm') === '00') {
              setStateChart((stateChart) => ({
                ...stateChart,
                dateChart: [...stateChart.dateChart, moment(Date.now()).format('DD/MM/YYYY hh:mm')],
                humiChart: [...stateChart.humiChart, res.data.humi],
                tempChart: [...stateChart.tempChart, res.data.temp]
              }))
            }
          } else {
            console.log("error");
          }
        })
    }, 5000);
    return () => clearInterval(interval);
  }

  const dateArr = stateChart.dateChart;
  const humiArr = stateChart.humiChart;
  const tempArr = stateChart.tempChart;
  if (dateArr[dateArr.length - 2] !== dateArr[dateArr.length - 1]) {
    if (dateArr.length > 12) {
      dateArr.shift();
      humiArr.shift();
      tempArr.shift();
      setStateChart({
        dateChart: dateArr,
        humiChart: humiArr,
        tempChart: tempArr
      })
    }
  } else {
    dateArr.pop();
    humiArr.pop();
    tempArr.pop();
  }

  const btnOnMotor = () => {
    setStatus(false)
    axios
      .post('http://localhost:3001/sendData', {
        status: 'MOTOR_ON'
      })
      .then(res => {
        if (res.status === 200) {
          setStatusMotor(res.data)
        } else {
          console.log("error");
        }
      })
  }

  const btnOffMotor = () => {
    setStatus(true)
    axios
      .post('http://localhost:3001/sendData', {
        status: 'MOTOR_OFF'
      })
      .then(res => {
        if (res.status === 200) {
          setStatusMotor(res.data)
        } else {
          console.log("error");
        }
      })
  }

  useEffect(() => {
    const idInterval = getData();
    return () => {
      clearInterval(idInterval);
    }
  }, [])

  return (
    <div>
      <div className='text-center p-5 title'>
        <h1>Hệ thống giám sát thông số môi trường</h1>
      </div>
      <Row className='m-0 p-5 text-center container-data'>
        <Col sm={2} className='p-5 container-data-details'>
          <h4>Độ ẩm đất</h4>
          <h2 className='pt-5'>{state.soil} %</h2>
          {(state.soil && state.soil <= 30) ? <h5 className='pt-5 text-danger'>Độ ẩm thấp</h5> : null}
          {(state.soil && state.soil > 30 && state.soil <= 60) ? <h5 className='pt-5 text-success'>Độ ẩm trung bình</h5> : null}
          {(state.soil && state.soil > 60) ? <h5 className='pt-5 text-danger'>Độ ẩm cao</h5> : null}
        </Col>
        <Col sm={1}></Col>
        <Col sm={2} className='p-5 container-data-details'>
          <h4>Nhiệt độ</h4>
          <h2 className='pt-5'>{state.temp} °C</h2>
          {(state.temp && state.temp <= 10) ? <h5 className='pt-5 text-danger'>Nhiệt độ rất thấp</h5> : null}
          {(state.temp && state.temp > 10 && state.temp <= 20) ? <h5 className='pt-5 text-warning'>Nhiệt độ thấp</h5> : null}
          {(state.temp && state.temp > 20 && state.temp <= 29) ? <h5 className='pt-5 text-success'>Nhiệt độ trung bình</h5> : null}
          {(state.temp && state.temp > 29) ? <h5 className='pt-5 text-warning'>Nhiệt độ cao</h5> : null}
        </Col>
        <Col sm={1}></Col>
        <Col sm={2} className='p-5 container-data-details'>
          <h4>Độ ẩm không khí</h4>
          <h2 className='pt-5'>{state.humi} %</h2>
          {(state.humi && state.humi <= 50) ? <h5 className='pt-5 text-danger'>Độ ẩm thấp</h5> : null}
          {(state.humi && state.humi > 50 && state.soil <= 75) ? <h5 className='pt-5 text-success'>Độ ẩm trung bình</h5> : null}
          {(state.humi && state.humi > 75) ? <h5 className='pt-5 text-danger'>Độ ẩm cao</h5> : null}
        </Col>
        <Col sm={1}></Col>
        <Col sm={3} className='p-5 container-data-details'>
          <h4>
            Điều khiển máy bơm
          </h4>
          <div className='pt-5'>
            {
              status ?
                <Button className='btn-on' onClick={btnOnMotor}>
                  On
              </Button> :
                <Button className='btn-off' onClick={btnOffMotor}>
                  Off
              </Button>
            }
          </div>
          <h5 className='pt-5'>
            Trạng thái: {statusMotor}
          </h5>
        </Col>
      </Row>
      <Row className='m-0 p-5 container-data'>
        <Col sm={6} className='p-5 container-data-details'>
          <h5 className='text-center'>
            Biểu đồ độ ẩm không khí trong 12h
          </h5>
          <Line
            data={{
              labels: stateChart.dateChart,
              datasets: [
                {
                  data: stateChart.humiChart,
                  label: "Độ ẩm",
                  borderColor: "#3e999d",
                  fill: false
                }
              ]
            }}
            options={{
              title: {
                display: true,
              },
              legend: {
                display: true,
                position: "bottom"
              }
            }}
          />
        </Col>
        <Col sm={6} className='p-5 container-data-details'>
          <h5 className='text-center'>
            Biểu đồ nhiệt độ trong 12h
          </h5>
          <Line
            data={{
              labels: stateChart.dateChart,
              datasets: [
                {
                  data: stateChart.tempChart,
                  label: "Nhiệt độ",
                  borderColor: "#3e95cd",
                  fill: false
                }
              ]
            }}
            options={{
              title: {
                display: true,
              },
              legend: {
                display: true,
                position: "bottom"
              }
            }}
          />
        </Col>
      </Row>
    </div>
  );
}

export default App;
