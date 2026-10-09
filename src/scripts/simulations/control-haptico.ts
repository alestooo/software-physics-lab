type HapticProfile =
  | "soft"
  | "medium"
  | "hard"
  | "bow";

type ProfileConfig = {
  k: number;
  travel: number;
  speed: number;
  label: string;
};

const root =
  document.querySelector(
    "#haptic-lab"
  );

if (root instanceof HTMLElement) {
  const springControl =
    root.querySelector(
      "#spring-control"
    );

  const travelControl =
    root.querySelector(
      "#travel-control"
    );

  const displacementControl =
    root.querySelector(
      "#displacement-control"
    );

  const cycleSpeedControl =
    root.querySelector(
      "#cycle-speed-control"
    );

  const curve =
    root.querySelector(
      "#haptic-curve"
    );

  const marker =
    root.querySelector(
      "#haptic-marker"
    );

  const virtualTrigger =
    root.querySelector(
      "#virtual-trigger"
    );

  const resetButton =
    root.querySelector(
      "#haptic-reset"
    );

  const playButton =
    root.querySelector(
      "#haptic-play"
    );

  const profiles:
    Record<
      HapticProfile,
      ProfileConfig
    > = {
      soft: {
        k: 10,
        travel: 55,
        speed: 0.55,
        label: "Resistencia suave",
      },

      medium: {
        k: 22,
        travel: 50,
        speed: 0.70,
        label: "Resistencia media",
      },

      hard: {
        k: 50,
        travel: 40,
        speed: 0.85,
        label: "Resistencia fuerte",
      },

      bow: {
        k: 35,
        travel: 50,
        speed: 0.40,
        label: "Perfil arco",
      },
    };

  let running = false;
  let animationFrame = 0;
  let startTimestamp = 0;

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

  const getValue = (
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

  const scaleX = (
    displacement: number,
    maxTravelMeters: number
  ): number => {
    return (
      70 +
      displacement /
      maxTravelMeters *
      650
    );
  };

  const scaleY = (
    force: number,
    maxForce: number
  ): number => {
    return (
      260 -
      force /
      maxForce *
      230
    );
  };

  const update =
    (): void => {
      const k =
        getValue(
          springControl,
          22
        );

      const travel =
        getValue(
          travelControl,
          50
        );

      let displacement =
        getValue(
          displacementControl,
          30
        );

      displacement =
        Math.min(
          displacement,
          travel
        );

      if (
        displacementControl instanceof HTMLInputElement
      ) {
        displacementControl.max =
          String(
            travel
          );

        displacementControl.value =
          String(
            displacement
          );
      }

      const speed =
        getValue(
          cycleSpeedControl,
          0.7
        );

      const x =
        displacement /
        1000;

      const maxX =
        travel /
        1000;

      const force =
        k *
        x;

      const maxForce =
        Math.max(
          k *
          maxX,
          0.1
        );

      setText(
        "#spring-value",
        `${k.toFixed(0)} N/m`
      );

      setText(
        "#travel-value",
        `${travel.toFixed(0)} mm`
      );

      setText(
        "#displacement-value",
        `${displacement.toFixed(0)} mm`
      );

      setText(
        "#displacement-max-label",
        `${travel.toFixed(0)} mm`
      );

      setText(
        "#cycle-speed-value",
        `${speed.toFixed(2)} Hz`
      );

      setText(
        "#k-live",
        `${k.toFixed(0)} N/m`
      );

      setText(
        "#x-live",
        `${x.toFixed(3)} m`
      );

      setText(
        "#force-live-haptic",
        `${force.toFixed(2)} N`
      );

      setText(
        "#haptic-force",
        `${force.toFixed(2)} N`
      );

      setText(
        "#haptic-force-hero",
        `${force.toFixed(2)} N`
      );

      setText(
        "#haptic-substitution",
        `F = −(${k.toFixed(0)})(${x.toFixed(3)})`
      );

      setText(
        "#haptic-result",
        `F = −${force.toFixed(2)} N`
      );

      let state =
        "Resistencia suave";

      if (k >= 18) {
        state =
          "Resistencia media";
      }

      if (k >= 40) {
        state =
          "Resistencia fuerte";
      }

      setText(
        "#haptic-state",
        state
      );

      const points =
        Array.from(
          {
            length: 61,
          },
          (
            _,
            index
          ) => {
            const ratio =
              index /
              60;

            const pointX =
              maxX *
              ratio;

            return {
              x: pointX,

              force:
                k *
                pointX,
            };
          }
        );

      const d =
        points
          .map(
            (
              point,
              index
            ) => {
              return `${
                index === 0
                  ? "M"
                  : "L"
              } ${scaleX(point.x, maxX).toFixed(2)} ${scaleY(point.force, maxForce).toFixed(2)}`;
            }
          )
          .join(" ");

      if (
        curve instanceof SVGPathElement
      ) {
        curve.setAttribute(
          "d",
          d
        );
      }

      if (
        marker instanceof SVGCircleElement
      ) {
        marker.setAttribute(
          "cx",
          String(
            scaleX(
              x,
              maxX
            )
          )
        );

        marker.setAttribute(
          "cy",
          String(
            scaleY(
              force,
              maxForce
            )
          )
        );
      }

      if (
        virtualTrigger instanceof HTMLElement
      ) {
        const ratio =
          travel > 0
            ? displacement /
              travel
            : 0;

        const rotation =
          ratio *
          30;

        virtualTrigger.style.transform =
          `rotate(${rotation}deg)`;
      }

      const arrow =
        root.querySelector(
          "#force-arrow-line"
        );

      if (
        arrow instanceof HTMLElement
      ) {
        const ratio =
          maxForce > 0
            ? force /
              maxForce
            : 0;

        arrow.style.width =
          `${25 + ratio * 90}px`;
      }
    };

  const stop =
    (): void => {
      running = false;

      cancelAnimationFrame(
        animationFrame
      );

      startTimestamp = 0;

      setText(
        "#haptic-play-icon",
        "▶"
      );

      setText(
        "#haptic-play-text",
        "Continuar ciclo"
      );

      setText(
        "#haptic-phase",
        "Pausa"
      );

      setText(
        "#cycle-live",
        "pausa"
      );

      setText(
        "#haptic-hero-phase",
        "Ciclo en pausa"
      );
    };

  const animate = (
    timestamp: number
  ): void => {
    if (!running) {
      return;
    }

    if (!startTimestamp) {
      startTimestamp =
        timestamp;
    }

    const elapsed =
      (
        timestamp -
        startTimestamp
      ) /
      1000;

    const speed =
      getValue(
        cycleSpeedControl,
        0.7
      );

    const travel =
      getValue(
        travelControl,
        50
      );

    /*
      Oscilación 0 -> 1 -> 0.
    */
    const phase =
      (
        Math.sin(
          2 *
          Math.PI *
          speed *
          elapsed -
          Math.PI /
          2
        ) +
        1
      ) /
      2;

    const displacement =
      phase *
      travel;

    if (
      displacementControl instanceof HTMLInputElement
    ) {
      displacementControl.value =
        displacement.toFixed(1);
    }

    const derivative =
      Math.cos(
        2 *
        Math.PI *
        speed *
        elapsed -
        Math.PI /
        2
      );

    if (
      derivative >= 0
    ) {
      setText(
        "#haptic-phase",
        "Presionando"
      );

      setText(
        "#cycle-live",
        "presión"
      );

      setText(
        "#haptic-hero-phase",
        "Aumentando desplazamiento"
      );
    } else {
      setText(
        "#haptic-phase",
        "Liberando"
      );

      setText(
        "#cycle-live",
        "liberación"
      );

      setText(
        "#haptic-hero-phase",
        "Fuerza restauradora"
      );
    }

    update();

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
          startTimestamp = 0;

          setText(
            "#haptic-play-icon",
            "❚❚"
          );

          setText(
            "#haptic-play-text",
            "Pausar ciclo"
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
    springControl,
    travelControl,
    displacementControl,
    cycleSpeedControl,
  ].forEach(
    (control) => {
      if (
        control instanceof HTMLInputElement
      ) {
        control.addEventListener(
          "input",
          () => {
            if (
              control ===
              displacementControl &&
              running
            ) {
              stop();
            }

            update();
          }
        );
      }
    }
  );

  root
    .querySelectorAll(
      "[data-haptic-profile]"
    )
    .forEach(
      (button) => {
        if (
          button instanceof HTMLButtonElement
        ) {
          button.addEventListener(
            "click",
            () => {
              const profile =
                button.dataset.hapticProfile;

              if (
                profile !== "soft" &&
                profile !== "medium" &&
                profile !== "hard" &&
                profile !== "bow"
              ) {
                return;
              }

              const config =
                profiles[
                  profile
                ];

              if (
                springControl instanceof HTMLInputElement
              ) {
                springControl.value =
                  String(
                    config.k
                  );
              }

              if (
                travelControl instanceof HTMLInputElement
              ) {
                travelControl.value =
                  String(
                    config.travel
                  );
              }

              if (
                cycleSpeedControl instanceof HTMLInputElement
              ) {
                cycleSpeedControl.value =
                  String(
                    config.speed
                  );
              }

              if (
                displacementControl instanceof HTMLInputElement
              ) {
                displacementControl.value =
                  String(
                    config.travel *
                    0.6
                  );
              }

              root
                .querySelectorAll(
                  "[data-haptic-profile]"
                )
                .forEach(
                  (item) => {
                    item.classList.toggle(
                      "active",
                      item === button
                    );
                  }
                );

              setText(
                "#haptic-state",
                config.label
              );

              update();
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
        running =
          false;

        cancelAnimationFrame(
          animationFrame
        );

        startTimestamp = 0;

        if (
          springControl instanceof HTMLInputElement
        ) {
          springControl.value =
            "22";
        }

        if (
          travelControl instanceof HTMLInputElement
        ) {
          travelControl.value =
            "50";
        }

        if (
          displacementControl instanceof HTMLInputElement
        ) {
          displacementControl.value =
            "30";
        }

        if (
          cycleSpeedControl instanceof HTMLInputElement
        ) {
          cycleSpeedControl.value =
            "0.70";
        }

        root
          .querySelectorAll(
            "[data-haptic-profile]"
          )
          .forEach(
            (item) => {
              item.classList.toggle(
                "active",
                item instanceof HTMLButtonElement &&
                item.dataset.hapticProfile ===
                  "medium"
              );
            }
          );

        setText(
          "#haptic-play-icon",
          "▶"
        );

        setText(
          "#haptic-play-text",
          "Iniciar ciclo"
        );

        setText(
          "#haptic-phase",
          "Manual"
        );

        setText(
          "#cycle-live",
          "detenido"
        );

        setText(
          "#haptic-hero-phase",
          "Gatillo en reposo"
        );

        update();
      }
    );
  }

  update();
}

export {};