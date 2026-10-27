import React, { Component } from "react";
import "./Card.css";

const imageModules = import.meta.glob("./assets/images/*.webp", {
  eager: true,
  import: "default",
});

function getFruitImage(imageKey) {
  if (!imageKey) {
    return imageModules["./assets/images/undefined.webp"] || "";
  }
  return (
    imageModules[`./assets/images/${imageKey}.webp`] ||
    imageModules["./assets/images/undefined.webp"] ||
    ""
  );
}

class Card extends Component {
  render() {
    const imageUrl = getFruitImage(this.props.image);
    return (
      <div className="card-size">
        <div className="card-image img-align">
          <img
            src={imageUrl}
            alt={this.props.title || "fruta"}
            className="img-responsive"
            width="40"
            height="40"
            loading="lazy"
            decoding="async"
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
