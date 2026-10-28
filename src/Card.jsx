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
  constructor(props) {
    super(props);
    this.state = { showTip: false };
  }

  handleClick = () => {
    if (this.props.tip) {
      this.setState((prev) => ({ showTip: !prev.showTip }));
    }
  };

  handleOverlayClick = (e) => {
    e.stopPropagation();
    this.setState({ showTip: false });
  };

  render() {
    const imageUrl = getFruitImage(this.props.image);
    return (
      <>
        <div className={`card-size card-clickable"`} onClick={this.handleClick}>
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
        {this.state.showTip && (
          <div className="tip-overlay" onClick={this.handleOverlayClick}>
            <div className="tip-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tip-modal-header">
                <img
                  src={imageUrl}
                  alt={this.props.title || "fruta"}
                  className="tip-modal-image"
                  width="48"
                  height="48"
                />
                <strong className="tip-modal-title">{this.props.title}</strong>
                <button
                  className="tip-modal-close"
                  onClick={this.handleOverlayClick}
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>
              <p className="tip-modal-text">{this.props.tip}</p>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default Card;
