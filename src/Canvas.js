import React from 'react';

import Drawer from './Drawer';

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: {},
      output: {}
    };
  }

  componentDidMount() {
    Drawer.init(this.canvas);
  }

  handleChangeIn = () => {
    let file = this.input.files[0];
    let that = this;
    if (file) {
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function (evt) {
        let lines = evt.target.result.split('\n');
        let [height, width, radius] = lines[0].split(' ').map((x) => parseInt(x));
        let [br, bc] = lines[2].split(' ').map((x) => parseInt(x));

        let input = {
          width,
          height,
          radius,
          '#': [],
          '.': [],
          '-': []
        };

        for (let i = 3; i < height; i++) {
          for (let j = 0; j < width; j++) {
            input[lines[i][j]].push({x: j, y: i});
          }
        }
        that.setState({
          input,
          output: {
            'r': [],
            'b': [
              {x: bc, y: br}
            ]
          }
        });

        Drawer.draw(that.state.input, that.state.output);
      }
    }
  };

  handleChangeOut = () => {
    let file = this.output.files[0];
    let that = this;
    if (file) {
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function (evt) {
        let lines = evt.target.result.split('\n');
        let bs = parseInt(lines[0]);
        let output = {
          'r': [],
          'b': [],
        };

        for (let i = 0; i < bs; i++) {
          let [y, x] = lines[1 + i].split(' ').map((x) => parseInt(x));
          output.b.push({x, y});
        }

        let rs = parseInt(lines[1 + bs]);

        for (let i = 0; i < rs; i++) {
          let [y, x] = lines[2 + bs + i].split(' ').map((x) => parseInt(x));
          output.r.push({x, y});
        }

        that.setState({
          output: {
            'r': output.r,
            'b': that.state.output.b.concat(output.b)
          }
        });
        Drawer.draw(that.state.input, that.state.output);
      }
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
  };

  render() {
    return (
      <div className="clearfix container">
        <canvas width="1000" height="1000" ref={canvas => this.canvas = canvas}/>
        <div className="controls">
          In
          <form onSubmit={this.handleSubmit}>
            <input type="file" ref={input => this.input = input} onChange={this.handleChangeIn}/>
          </form>
          Out
          <form onSubmit={this.handleSubmit}>
            <input type="file" ref={input => this.output = input} onChange={this.handleChangeOut}/>
          </form>
        </div>
      </div>
    )
  }
}