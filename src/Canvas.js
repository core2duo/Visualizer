import React from 'react';

import Drawer from './Drawer';

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      uploaded: false,
      move: 0,
      maxMoves: 0,
    };
  }

  applyMoves(to) {
    let data = JSON.parse(JSON.stringify(this.data));
    console.log(data, this.data);
    for (let i = 0; i < to; i++) {
      this.applyMove(data, this.state.data['moves'][i]);
    }
    return data;
  }

  applyMove(obj, move) {
    if (move['claim'] !== undefined) {
      let s = move['claim']['source'];
      let t = move['claim']['target'];
      let p = move['claim']['punter'];
      let key = [Math.min(s, t), Math.max(s, t)].join(':');
      if (obj['map']['color'] === undefined) {
        obj['map']['color'] = {};
      }
      obj['map']['color'][key] = p;
    }
  }

  moveToStr(move) {
    let str;
    let p;
    if (move['claim'] !== undefined) {
      p = move['claim']['punter'];
      let s = move['claim']['source'];
      let t = move['claim']['target'];
      str = "Claim " + s + " " + t;
    } else {
      p = move['pass']['punter'];
      str = "Pass"
    }
    return "Player " + p + ": " + str;
  }

  componentDidMount() {
    Drawer.init(this.canvas);
  }

  handleChange = () => {
    let file = this.input.files[0];
    let that = this;
    if (file) {
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function (evt) {
        let data = JSON.parse(evt.target.result);
        let temp = JSON.parse(evt.target.result);

        data['map']['sites'] = {};
        for (let site of temp['map']['sites']) {
          data['map']['sites'][site['id']] = {
            x: site['x'],
            y: site['y'],
          }
        }

        that.data = JSON.parse(JSON.stringify(data));
        that.setState({
          data: data,
          uploaded: true,
          maxMoves: data['moves'].length - 1,
        });

        Drawer.draw(data['map']);
      }
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
  };

  changeMove = (value) => {
    let data = this.applyMoves(value);
    Drawer.draw(data['map']);

    this.setState({
      move: value
    })
  };

  handleMoveChange = (e) => {
    let v = parseInt(e.target.value, 10);
    v = Math.max(0, v);
    v = Math.min(v, this.state.maxMoves);
    this.changeMove(v);
  };

  next = () => {
    if (this.state.move + 1 <= this.state.maxMoves) {
      this.changeMove(this.state.move + 1);
    }
  };

  prev = () => {
    if (this.state.move - 1 >= 0) {
      this.changeMove(this.state.move - 1);
    }
  };

  render() {
    return (
      <div className="clearfix container">
        <canvas width="970" height="700" ref={canvas => this.canvas = canvas}/>
        <div className="controls">
          {!this.state.uploaded && (
          <form onSubmit={this.handleSubmit}>
            <input type="file" ref={input => this.input = input} onChange={this.handleChange}/>
          </form>
          )}
          {this.state.uploaded && (
            <div className="moves-container">
              <div>
                <button onClick={this.prev}>Prev</button>
                Move <input type="number" className="controls__move" value={this.state.move}
                            onChange={this.handleMoveChange}/> of {this.state.maxMoves}
                <button onClick={this.next}>Next</button>
              </div>
              <ul className="moves">
                {this.state.data['moves'].map((move, index) => (
                  <li key={index} className={index === this.state.move ? "moves__move moves__move_current" : "moves__move"}>{this.moveToStr(move)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }
}