import logo from './logo.svg';
import './App.css';
import React from 'react';
import { FaSearch } from 'react-icons/fa';
import debounce from "lodash.debounce";

const axios = require('axios').default;


function Header() {
  return (
    <h1 className='App-header'>Temperature Sensor</h1>
  );
}

function YLegendP() {
  var yrow = [];
  for (var i = 0; i < 13; i++) {
    yrow.push(<g key={i} transform={`translate(0,${130 - (i * 10)})`}><text style={{ fontSize: 8 }}>{i * 10}</text></g>)
  }
  return (
    yrow
  )
}

function YLegendN() {
  var yrow = [];
  for (var i = 1; i < 5; i++) {
    yrow.push(<g key={i} transform={`translate(0,${130 + (i * 10)})`}><text style={{ fontSize: 8 }}>-{i * 10}</text></g>)
  }
  return (
    yrow
  )
}

function XLegendP(props){
  var xrow = [];
  if(typeof props != 'undefined'){
      if(typeof props.dates != 'undefined'){
        if(props.dates.length>0){
          for (let i = 0, l=props.dates.length; i < l; i++) {
            xrow.push(<g key={i} transform={`translate(${props.dates[i].x},130) rotate(45)`}><text style={{ fontSize: 6 }}>{((new Date(props.dates[i].date)).toLocaleString())}</text></g>)
          }
        }
      }
  }
  return (
    xrow
  )
}

class TempGraph extends React.Component {
  render() {
    return (
      <div className={this.props.className} tabIndex="-1">
        <svg {...this.props} height={30} width={100} className="graphsvg" viewBox="0 0 400 170">
          <g transform={`translate(${this.props.x + 4},${this.props.y})`}>
            <text style={{ fontSize: 10, }}>{this.props.temp}°C</text>
          </g>
          <circle cx={this.props.x} cy={this.props.y} r={3} stroke="#000" fill="red" />
          <YLegendP></YLegendP>
          <YLegendN></YLegendN>
          <XLegendP dates={this.props.dates}></XLegendP>
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

class TempRecords extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recs: [],
      searchrecs:[],
      coord: "",
      x: 20,
      y: 127,
      temp: 0,
      recordsintable: [],
      datesintable:[],
      dates:[]      
    };
    this.getTempData = this.getTempData.bind(this);
    this.deleteTemp = this.deleteTemp.bind(this);
    this.searchRecord = this.searchRecord.bind(this);
  }

  async getTempData() {
    const res = await axios.get('http://localhost:4999/getTemp');
    this.setState({ recs: res.data }, ()=>{this.searchRecord()});
  }

  viewTempData() {
    if(this.state.recordsintable.length>0){
      var coords = "";
      var xs = 20;
      var ys = 127;
      var temps = 0;
      var dates = [];
      for(let i=0,l = 429;i<l;i++){
        var thetemp = this.state.recordsintable[parseInt(i*((this.state.recordsintable.length-1)/(l-1)))];
        coords = (xs == 20 ? `M 20,${127 - thetemp}` : coords + ' L ' + xs + ',' + (ys));
        xs = xs + 1;
        ys = (127 - thetemp);
        temps = thetemp;
        if(i%42 == 0){
          dates.push({x: xs, date: this.state.datesintable[parseInt(i*((this.state.datesintable.length-1)/(l-1)))]});
        }
      }
      this.setState({
        coord: coords,
        x: xs,
        y: ys,
        temp: temps,
        dates: dates
      });
      document.getElementsByClassName("viewrecs")[0].style.display="block";
      document.getElementsByClassName("viewrecs")[0].focus({preventScroll:false});
    }else{
      document.getElementsByClassName("viewrecs")[0].style.display="none";
    }
  }

  async deleteTemp(theid) {
    const res = await axios.delete(`http://localhost:4999/deleteTemp`, { data: { id: theid }, headers: { Authorization: "***" } });
    this.getTempData();
  }

  async updateTemp(dt) {
    const res = await axios.post(`http://localhost:4999/updateTemp`, { id: dt.target.id, the_temp: dt.target.value });
  }

  tempTable(data) {
    var trow = [];
    for (var i = 0; i < data.length; i++) {
      trow.push(<tr key={data[i]._id}>
        <td>{(new Date(data[i].the_date)).toLocaleString()}</td>
        <td><input defaultValue={data[i].the_temp} id={data[i]._id} onChange={this.updateTemp} type="text"></input></td>
        <td><button value={data[i]._id} onClick={e => this.deleteTemp(e.target.value)}>Delete</button></td>
      </tr>)
    }
    return (
      trow
    )
  }

  searchRecord() {
    var input = document.getElementById("searchtemp").value.toUpperCase();
    var tempvalues=[], schrecs=[], tempdates=[];
    if(input.length==0){
      schrecs = [...this.state.recs];
      for(let i=0, l=this.state.recs.length;i<l;i++){
        tempvalues.push(this.state.recs[i].the_temp);
        tempdates.push(this.state.recs[i].the_date);
      }
      this.setState({
        recordsintable: tempvalues.reverse(),
        searchrecs: schrecs,
        datesintable: tempdates.reverse()
      }, ()=>{
        console.log(this.state.recordsintable);
        console.log(this.state.searchrecs);
      });
      return;
    }
    for(let i=0, l=this.state.recs.length;i<l;i++){
      if((new Date(this.state.recs[i].the_date)).toLocaleString().indexOf(input) > -1 || (this.state.recs[i].the_temp).toString().indexOf(input) > -1){
        tempvalues.push(this.state.recs[i].the_temp);
        schrecs.push(this.state.recs[i]);
        tempdates.push(this.state.recs[i].the_date);
      }
    }
    this.setState({
      recordsintable: tempvalues.reverse(),
      searchrecs: schrecs,
      datesintable: tempdates.reverse()
    }, ()=>{
      console.log(this.state.recordsintable);
      console.log(this.state.searchrecs);
      console.log(this.state.datesintable);
    });
  }

  render() {
    return (
      <div>
      <div className='box'>

        <div className='wrapper'>
          <Button action={this.getTempData} text="Get Records"></Button>
          <FaSearch className="icon" />
          <input type="text" id="searchtemp" onKeyUp={this.searchRecord} placeholder="Search for date or temp." title="Type in a date or temp."></input>
          <Button action={()=>{this.viewTempData()}} text="View Records"></Button>
        </div>
        <div className='temptb'>
          <table id="tbtemp">
            <thead>
              <tr>
                <td>Date</td>
                <td>Temperature</td>
              </tr>
            </thead>
            <tbody>
              {this.tempTable(this.state.searchrecs)}
            </tbody>
          </table>
        </div>
      </div>
      <TempGraph coord={this.state.coord} x={this.state.x} y={this.state.y} temp={this.state.temp} dates={this.state.dates} className="viewrecs"></TempGraph>
      </div>
    )
  }
}

class Button extends React.Component {
  render() {
    return (
      <button id={this.props.id} onClick={this.props.action}>{this.props.text}</button>
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
    this.closeport = this.closeport.bind(this);
    this.isportopen = false;
  }

  async openport(port) {
    await port.open({ baudRate: 9600 });
    while (port.readable) {
      const reader = port.readable.getReader();
      try {
        while (this.isportopen) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          var thetemp = value[0];
          thetemp = thetemp > 127 ? (257 + ~thetemp) * (-1) : thetemp;
          axios.post(`http://localhost:4999/addTemp`, {
            temp: thetemp
          }).catch(function (error) {
            console.log(error);
          });
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
        await port.close();
      }
    }
  }

  async connectSerialPort(e) {
    this.isportopen = true;
    await navigator.serial.requestPort();
    navigator.serial.getPorts().then((ports) => {
      if (ports.length) {
        this.openport(ports[0]);
      }
    });
    e.target.style.display="none";
    document.getElementById("bcloseport").style.display = "inline-block";
  }

  async closeport(e) {
    this.isportopen = false;
    e.target.style.display="none";
    document.getElementById("bopenport").style.display = "";
  }

  render() {
    return (
      <div className=''>
        <TempGraph coord={this.state.coord} x={this.state.x} y={this.state.y} temp={this.state.temp} className="graph"></TempGraph>
        <div className='box'>
          <Button id="bopenport" action={this.connectSerialPort} text="Open Port"></Button>
          <Button id="bcloseport" action={this.closeport} text="Close Port"></Button>
        </div>
        <TempConvertion></TempConvertion>
        <TempRecords></TempRecords>
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
