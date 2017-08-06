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

  getKey(site1, site2) {
    return [Math.min(site1, site2), Math.max(site1, site2)].join(':');
  }

  applyMoves(to) {
    let data = JSON.parse(JSON.stringify(this.data));
    console.log(data, this.data);
    for (let i = 0; i <= to; i++) {
      this.applyMove(data, this.state.data['moves'][i]);
    }
    return data;
  }

  applyMove(obj, move) {
    let p = this.moveToPunter(move);

    if (move['claim'] !== undefined) {
      let s = move['claim']['source'];
      let t = move['claim']['target'];
      let key = this.getKey(s, t);
      if (obj['map']['color'] === undefined) {
        obj['map']['color'] = {};
      }
      obj['map']['color'][key] = p;
    }

    if (move['splurge'] !== undefined) {
      for (let i = 1; i < move['splurge']['route'].length; i++) {
        let key = this.getKey(move['splurge']['route'][i - 1], move['splurge']['route'][i]);
        if (obj['map']['color'] === undefined) {
          obj['map']['color'] = {};
        }
        obj['map']['color'][key] = p;
      }
    }
  }

  moveToStr(move) {
    let str;
    let p = this.moveToPunter(move);

    if (move['claim'] !== undefined) {
      let s = move['claim']['source'];
      let t = move['claim']['target'];
      str = "Claim " + s + " " + t;
    } else if (move['splurge'] !== undefined) {
      str = "Splurge " + move['splurge']['route'].join(' ');
    } else {
      str = "Pass"
    }
    return "Player " + p + ": " + str;
  }

  moveToPunter(move) {
    if (move['claim'] !== undefined) {
      return move['claim']['punter'];
    }
    if (move['splurge'] !== undefined) {
      return move['splurge']['punter'];
    }
    return move['pass']['punter']
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
        that.changeMove(0);
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

  start = () => {
    this.changeMove(0);
  };

  end = () => {
    this.changeMove(this.state.maxMoves - 1);
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
                <button onClick={this.start}>Start</button>
                {' '}
                <button onClick={this.end}>End</button>
              </div>
              <div>
                <button onClick={this.prev}>Prev</button>
                {' '}
                Move <input type="number" className="controls__move" value={this.state.move}
                            onChange={this.handleMoveChange}/> of {this.state.maxMoves}
                {' '}
                <button onClick={this.next}>Next</button>
              </div>
              <p>Selected player: {this.data['punter']}</p>
              <ul className="scores clearfix">
                {this.state.data['scores'].map((score, index) => (
                  <li key={index} className="scores__score">Punter {score['punter']}: {score['score']}</li>
                ))}
              </ul>
              <ul className="moves">
                {this.state.data['moves'].map((move, index) => (
                  <li key={index}
                      className={"moves__move " + (index === this.state.move ? "moves__move_current " : "") +
                      (this.moveToPunter(move) === this.state.data['punter'] ? "moves__move_player " : "")}>{this.moveToStr(move)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }
}