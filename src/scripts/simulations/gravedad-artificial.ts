type GravityPreset =
  | "earth"
  | "moon"
  | "mars"
  | "europa";

type RotationDirection =
  | "cw"
  | "ccw";

type GravityWorld = {
  name: string;
  g: number;
};

const root =
  document.querySelector(
    "#gravity-lab"
  );

if (root instanceof HTMLElement) {
  const radiusControl =
    root.querySelector(
      "#radius-control"
    );

  const rpmControl =
    root.querySelector(
      "#rpm-control"
    );

  const playButton =
    root.querySelector(
      "#gravity-play"
    );

  const resetButton =
    root.querySelector(
      "#gravity-reset"
    );

  const ring =
    root.querySelector(
      "#habitat-ring"
    );

  let running = false;
  let animationFrame = 0;
  let lastTimestamp = 0;
  let visualAngle = 0;

  let direction:
    RotationDirection =
    "cw";

  const worlds:
    Record<
      GravityPreset,
      GravityWorld
    > = {
      earth: {
        name: "Tierra",
        g: 1,
      },

      moon: {
        name: "Luna",
        g: 0.165,
      },

      mars: {
        name: "Marte",
        g: 0.378,
      },

      europa: {
        name: "Europa",
        g: 0.134,
      },
    };

  const setText = (
    selector: string,
    value: string
  ): void => {
    const element =
      root.querySelector(
        selector
      );

    if (element) {
      element.textContent =
        value;
    }
  };

  const getInput = (
    element: Element | null,
    fallback: number
  ): number => {
    if (
      element instanceof HTMLInputElement
    ) {
      const value =
        Number(
          element.value
        );

      return Number.isFinite(value)
        ? value
        : fallback;
    }

    return fallback;
  };

  const getNearestWorld = (
    currentG: number
  ): GravityWorld => {
    const values =
      Object.values(
        worlds
      );

    let closest =
      values[0];

    let difference =
      Math.abs(
        currentG -
        closest.g
      );

    values.forEach(
      (world) => {
        const currentDifference =
          Math.abs(
            currentG -
            world.g
          );

        if (
          currentDifference <
          difference
        ) {
          closest =
            world;

          difference =
            currentDifference;
        }
      }
    );

    return closest;
  };

  const update =
    (): void => {
      const radius =
        getInput(
          radiusControl,
          100
        );

      const rpm =
        getInput(
          rpmControl,
          2.99
        );

      const omega =
        2 *
        Math.PI *
        rpm /
        60;

      const acceleration =
        omega *
        omega *
        radius;

      const currentG =
        acceleration /
        9.81;

      const period =
        rpm > 0
          ? 60 /
            rpm
          : 0;

      const nearestWorld =
        getNearestWorld(
          currentG
        );

      const percentage =
        currentG *
        100;

      setText(
        "#radius-value",
        `${radius.toFixed(0)} m`
      );

      setText(
        "#rpm-value",
        `${rpm.toFixed(2)} rpm`
      );

      setText(
        "#diagram-radius",
        `r = ${radius.toFixed(0)} m`
      );

      setText(
        "#omega-live",
        `${omega.toFixed(3)} rad/s`
      );

      setText(
        "#acceleration-live",
        `${acceleration.toFixed(2)} m/s²`
      );

      setText(
        "#gravity-live",
        `${currentG.toFixed(2)} g`
      );

      setText(
        "#period-live",
        `${period.toFixed(2)} s`
      );

      setText(
        "#gravity-hero-g",
        `${currentG.toFixed(2)} g`
      );

      setText(
        "#gravity-hero-ms",
        `${acceleration.toFixed(2)} m/s²`
      );

      setText(
        "#gravity-hero-world",
        `Nivel más cercano: ${nearestWorld.name}`
      );

      setText(
        "#gravity-world-name",
        nearestWorld.name
      );

      setText(
        "#gravity-world-detail",
        `${percentage.toFixed(1)} % de la gravedad terrestre.`
      );

      setText(
        "#omega-equation",
        `ω = 2π(${rpm.toFixed(2)}) / 60 = ${omega.toFixed(3)} rad/s`
      );

      setText(
        "#gravity-equation",
        `aₙ = (${omega.toFixed(3)})²(${radius.toFixed(0)}) = ${acceleration.toFixed(2)} m/s²`
      );

      setText(
        "#g-equation",
        `${acceleration.toFixed(2)} / 9.81 = ${currentG.toFixed(2)} g`
      );
    };

  const stop =
    (): void => {
      running = false;

      cancelAnimationFrame(
        animationFrame
      );

      lastTimestamp = 0;

      setText(
        "#gravity-play-icon",
        "▶"
      );

      setText(
        "#gravity-play-text",
        "Continuar rotación"
      );

      setText(
        "#gravity-status",
        "En pausa"
      );
    };

  const animate = (
    timestamp: number
  ): void => {
    if (!running) {
      return;
    }

    if (!lastTimestamp) {
      lastTimestamp =
        timestamp;
    }

    const delta =
      (
        timestamp -
        lastTimestamp
      ) /
      1000;

    lastTimestamp =
      timestamp;

    const rpm =
      getInput(
        rpmControl,
        2.99
      );

    const directionFactor =
      direction === "cw"
        ? 1
        : -1;

    visualAngle +=
      directionFactor *
      rpm *
      24 *
      delta;

    if (
      ring instanceof SVGGElement
    ) {
      ring.setAttribute(
        "transform",
        `rotate(${visualAngle} 350 250)`
      );
    }

    animationFrame =
      requestAnimationFrame(
        animate
      );
  };

  if (
    playButton instanceof HTMLButtonElement
  ) {
    playButton.addEventListener(
      "click",
      () => {
        running =
          !running;

        if (running) {
          lastTimestamp = 0;

          setText(
            "#gravity-play-icon",
            "❚❚"
          );

          setText(
            "#gravity-play-text",
            "Pausar rotación"
          );

          setText(
            "#gravity-status",
            direction === "cw"
              ? "Girando ↻"
              : "Girando ↺"
          );

          animationFrame =
            requestAnimationFrame(
              animate
            );
        } else {
          stop();
        }
      }
    );
  }

  [
    radiusControl,
    rpmControl,
  ].forEach(
    (control) => {
      if (
        control instanceof HTMLInputElement
      ) {
        control.addEventListener(
          "input",
          () => {
            root
              .querySelectorAll(
                "[data-gravity-preset]"
              )
              .forEach(
                (button) => {
                  button.classList.remove(
                    "active"
                  );
                }
              );

            update();
          }
        );
      }
    }
  );

  root
    .querySelectorAll(
      "[data-gravity-preset]"
    )
    .forEach(
      (button) => {
        if (
          button instanceof HTMLButtonElement
        ) {
          button.addEventListener(
            "click",
            () => {
              if (
                !(radiusControl instanceof HTMLInputElement) ||
                !(rpmControl instanceof HTMLInputElement)
              ) {
                return;
              }

              const preset =
                button.dataset.gravityPreset;

              if (
                preset !== "earth" &&
                preset !== "moon" &&
                preset !== "mars" &&
                preset !== "europa"
              ) {
                return;
              }

              const target =
                worlds[
                  preset
                ];

              const radius =
                Number(
                  radiusControl.value
                );

              const targetAcceleration =
                target.g *
                9.81;

              const omega =
                Math.sqrt(
                  targetAcceleration /
                  radius
                );

              const rpm =
                omega *
                60 /
                (
                  2 *
                  Math.PI
                );

              rpmControl.value =
                Math.min(
                  8,
                  Math.max(
                    0.2,
                    rpm
                  )
                ).toFixed(2);

              root
                .querySelectorAll(
                  "[data-gravity-preset]"
                )
                .forEach(
                  (item) => {
                    item.classList.toggle(
                      "active",
                      item === button
                    );
                  }
                );

              update();
            }
          );
        }
      }
    );

  root
    .querySelectorAll(
      "[data-direction]"
    )
    .forEach(
      (button) => {
        if (
          button instanceof HTMLButtonElement
        ) {
          button.addEventListener(
            "click",
            () => {
              const selected =
                button.dataset.direction;

              if (
                selected !== "cw" &&
                selected !== "ccw"
              ) {
                return;
              }

              direction =
                selected;

              root
                .querySelectorAll(
                  "[data-direction]"
                )
                .forEach(
                  (item) => {
                    item.classList.toggle(
                      "active",
                      item === button
                    );
                  }
                );

              if (running) {
                setText(
                  "#gravity-status",
                  direction === "cw"
                    ? "Girando ↻"
                    : "Girando ↺"
                );
              }
            }
          );
        }
      }
    );

  if (
    resetButton instanceof HTMLButtonElement
  ) {
    resetButton.addEventListener(
      "click",
      () => {
        if (
          radiusControl instanceof HTMLInputElement
        ) {
          radiusControl.value =
            "100";
        }

        if (
          rpmControl instanceof HTMLInputElement
        ) {
          rpmControl.value =
            "2.99";
        }

        direction =
          "cw";

        running = false;

        cancelAnimationFrame(
          animationFrame
        );

        visualAngle = 0;
        lastTimestamp = 0;

        if (
          ring instanceof SVGGElement
        ) {
          ring.setAttribute(
            "transform",
            "rotate(0 350 250)"
          );
        }

        root
          .querySelectorAll(
            "[data-gravity-preset]"
          )
          .forEach(
            (item) => {
              item.classList.toggle(
                "active",
                item instanceof HTMLButtonElement &&
                item.dataset.gravityPreset ===
                  "earth"
              );
            }
          );

        root
          .querySelectorAll(
            "[data-direction]"
          )
          .forEach(
            (item) => {
              item.classList.toggle(
                "active",
                item instanceof HTMLButtonElement &&
                item.dataset.direction ===
                  "cw"
              );
            }
          );

        setText(
          "#gravity-play-icon",
          "▶"
        );

        setText(
          "#gravity-play-text",
          "Iniciar rotación"
        );

        setText(
          "#gravity-status",
          "En reposo"
        );

        update();
      }
    );
  }

  update();
}

export {};