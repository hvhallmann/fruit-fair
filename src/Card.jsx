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
    this.cardButtonRef = React.createRef();
    this.dialogRef = React.createRef();
    this.closeButtonRef = React.createRef();
  }

  componentDidUpdate(_, previousState) {
    if (!previousState.showTip && this.state.showTip) {
      this.dialogRef.current?.focus();
    }
    if (previousState.showTip && !this.state.showTip) {
      this.cardButtonRef.current?.focus();
    }
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

  handleDialogKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      this.setState({ showTip: false });
    } else if (event.key === "Tab") {
      event.preventDefault();
      this.closeButtonRef.current?.focus();
    }
  };

  render() {
    const imageUrl = getFruitImage(this.props.image);
    const cardContent = (
      <>
        <div className="card-image img-align">
          <img
            src={imageUrl}
            alt=""
            className="img-responsive"
            width="52"
            height="52"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="card-footer">
          <div className="card-title h7">{this.props.title}</div>
        </div>
      </>
    );

    return (
      <>
        {this.props.tip ? (
          <button
            ref={this.cardButtonRef}
            type="button"
            className="card-size card-clickable card-button"
            aria-haspopup="dialog"
            aria-expanded={this.state.showTip}
            onClick={this.handleClick}
          >
            {cardContent}
          </button>
        ) : (
          <div className="card-size">{cardContent}</div>
        )}
        {this.state.showTip && (
          <div className="tip-overlay" onClick={this.handleOverlayClick}>
            <div
              ref={this.dialogRef}
              className="tip-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`Dica sobre ${this.props.title || "o produto"}`}
              tabIndex={-1}
              onKeyDown={this.handleDialogKeyDown}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="tip-modal-header">
                <img
                  src={imageUrl}
                  alt=""
                  className="tip-modal-image"
                  width="48"
                  height="48"
                />
                <strong className="tip-modal-title">{this.props.title}</strong>
                <button
                  ref={this.closeButtonRef}
                  className="tip-modal-close"
                  onClick={this.handleOverlayClick}
                  aria-label="Fechar"
                  type="button"
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
