import React, { Component } from "react";
import "./Card.css";

// A imagem tem 11,3cm width por 8,51cm d height
// com resolution de 7,87 pixel/cml
// 18KB
class Card extends Component {
  render() {
    const metauUrl = import.meta.url;
    const imageUrl = new URL(
      `./assets/images/${this.props.image}.png`,
      metauUrl,
    ).href;
    return (
      <div className="card-size">
        <div className="card-image img-align">
          <img
            src={imageUrl}
            alt={this.props.title || "fruta"}
            className="img-responsive"
          />
        </div>
        <div className="card-footer">
          <div className="card-title h7">{this.props.title}</div>
        </div>
      </div>
    );
  }
}

export default Card;
