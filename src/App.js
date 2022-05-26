import logo from './logo.svg';
import './App.css';
import React from 'react';

function Header() {
  return (
    <h1 className='App-header'>Temperature Sensor</h1>
  );
}

function YLegendP() {
  var yrow = [];
  for (var i = 0; i < 13; i++) {
    yrow.push(<g transform={`translate(0,${130 - (i * 10)})`}><text style={{ fontSize: 8 }}>{i * 10}</text></g>)
  }
  return (
    yrow
  )
}

function YLegendN() {
  var yrow = [];
  for (var i = 1; i < 5; i++) {
    yrow.push(<g transform={`translate(0,${130 + (i * 10)})`}><text style={{ fontSize: 8 }}>-{i * 10}</text></g>)
  }
  return (
    yrow
  )
}

class TempGraph extends React.Component {
  render() {
    return (
        <div className='graph'>
          <svg {...this.props} height={30} width={100} className="graphsvg" viewBox="0 0 400 170">
            <g transform={`translate(${this.props.x + 4},${this.props.y})`}>
              <text style={{ fontSize: 10, }}>{this.props.temp}°C</text>
            </g>
            <circle cx={this.props.x} cy={this.props.y} r={3} stroke="#000" fill="red" />
            <YLegendP></YLegendP>
            <YLegendN></YLegendN>
            <path
              style={{
                stroke: "black",
                strokeWidth: 1,
                fill: 'none'
              }}
              d={`M 10,127 h 500 M 15,122 h 3 M 15,117 h 5 M 15,112 h 3 M 15,107 h 5 M 15,102 h 3 M 15,97 h 5 M 15,92 h 3 M 15,87 h 5 M 15,82 h 3 M 15,77 h 5 M 15,72 h 3 M 15,67 h 5 M 15,62 h 3 M 15,57 h 5 M 15,52 h 3 M 15,47 h 5 M 15,42 h 3 M 15,37 h 5 M 15,32 h 3 M 15,27 h 5 M 15,22 h 3 M 15,17 h 5 M 15,12 h 3 M 15,7 h 5 M 15,2 h 3
          M 15,132 h 3 M 15,137 h 5 M 15,142 h 3 M 15,147 h 5 M 15,152 h 3 M 15,157 h 5 M 15,162 h 3 M 15,167 h 5 M 15,172 h 3`}
            />
            <path
              style={{
                stroke: "red",
                strokeWidth: 1,
                fill: "none",
              }}
              d={`${this.props.coord}`}
            />
            {"Sorry, your browser does not support inline SVG."}
          </svg>
        </div>
    );
  }
}

class TempConvertion extends React.Component {
  constructor(props) {
    super(props);
    this.calcC = this.calcC.bind(this);
    this.calcF = this.calcF.bind(this);
  }

  calcF(ct) {
    document.getElementById("txtFt").value = ((ct.target.value * 1.8) + 32).toFixed(2);
  }

  calcC(ft) {
    document.getElementById("txtCt").value = ((ft.target.value - 32) * 0.5556).toFixed(2);
  }

  render() {
    return (
      <div className='box'>
        <h4>Temperature Conversion</h4>
        <span>°C </span>
        <input type="text" id="txtCt" onChange={this.calcF} className="txtInput"></input>
        <br></br>
        <span>°F </span>
        <input type="text" id="txtFt" onChange={this.calcC} className="txtInput"></input>
      </div>
    );
  }
}

class Button extends React.Component {
  render() {
    return (
      <button onClick={this.props.action}>{this.props.text}</button>
    )
  }
}

class Body extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coord: "",
      x: 20,
      y: 127,
      temp: 0,
    };
    this.openport = this.openport.bind(this);
    this.connectSerialPort = this.connectSerialPort.bind(this);
  }

  async openport(port) {
    await port.open({ baudRate: 9600 });
    while (port.readable) {
      const reader = port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          var thetemp = value[0];
          thetemp = thetemp > 127 ? (257 + ~thetemp) * (-1) : thetemp;
          console.log(thetemp);
          this.setState({
            coord: this.state.x < 450 ? (this.state.x == 20 ? `M 20,${127 - thetemp}` : this.state.coord + ' L ' + this.state.x + ',' + (this.state.y)) : `M 20,${this.state.y}`,
            x: this.state.x < 450 ? this.state.x + 1 : 20,
            y: (127 - thetemp),
            temp: thetemp,
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        reader.releaseLock();
      }
    }
  }

  async connectSerialPort() {
    await navigator.serial.requestPort();

    navigator.serial.getPorts().then((ports) => {
      if (ports.length) {
        this.openport(ports[0]);
      }
    });
  }

  render() {
    return (
      <div className=''>
        <TempGraph coord={this.state.coord} x={this.state.x} y={this.state.y} temp={this.state.temp} className=""></TempGraph>
        <div className='box'>
          <Button action={this.connectSerialPort} text="Open Port"></Button>
        </div>
        <TempConvertion></TempConvertion>
      </div>
    );
  }
}

function App() {

  return (
    <div className="App">
      <Header></Header>
      <Body></Body>
    </div>
  );
}

export default App;
