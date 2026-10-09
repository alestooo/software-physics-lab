type CompoundName =
  | "soft"
  | "medium"
  | "hard";

type DrivingMode =
  | "conservative"
  | "balanced"
  | "push";

type Compound = {
  optimum: number;
  sigma: number;
  peak: number;
  workingMin: number;
  workingMax: number;
};

const root =
  document.querySelector(
    "#f1-lab"
  );

if (root instanceof HTMLElement) {
  const temperatureControl =
    root.querySelector(
      "#temperature-control"
    );

  const trackTemperatureControl =
    root.querySelector(
      "#track-temperature-control"
    );

  const loadControl =
    root.querySelector(
      "#load-control"
    );

  const curve =
    root.querySelector(
      "#grip-curve"
    );

  const marker =
    root.querySelector(
      "#grip-marker"
    );

  const markerPulse =
    root.querySelector(
      "#grip-marker-pulse"
    );

  const markerGuideX =
    root.querySelector(
      "#marker-guide-x"
    );

  const markerGuideY =
    root.querySelector(
      "#marker-guide-y"
    );

  const optimumWindow =
    root.querySelector(
      "#optimum-window"
    );

  const resetButton =
    root.querySelector(
      "#f1-reset"
    );

  const playButton =
    root.querySelector(
      "#f1-play"
    );

  const progress =
    root.querySelector(
      "#f1-progress"
    );

  const car =
    root.querySelector(
      "#f1-car"
    );

  const tyre =
    root.querySelector(
      "#f1-tyre"
    );

  const light1 =
    root.querySelector(
      "#f1-light-1"
    );

  const light2 =
    root.querySelector(
      "#f1-light-2"
    );

  const light3 =
    root.querySelector(
      "#f1-light-3"
    );

  let compound: CompoundName =
    "soft";

  let drivingMode: DrivingMode =
    "balanced";

  let running = false;
  let animationFrame = 0;
  let lastTimestamp = 0;
  let lapTime = 0;

  const lapDuration = 30;

  const compounds: Record<
    CompoundName,
    Compound
  > = {
    // Ventanas térmicas tomadas de Pirelli 2019:
    // C5: 85–115 °C, C3: 105–135 °C, C1: 110–140 °C.
    // Los valores peak son parámetros didácticos del modelo, no telemetría real.
    soft: {
      optimum: 100,
      sigma: 18,
      peak: 1.78,
      workingMin: 85,
      workingMax: 115,
    },
    medium: {
      optimum: 120,
      sigma: 18,
      peak: 1.68,
      workingMin: 105,
      workingMax: 135,
    },
    hard: {
      optimum: 125,
      sigma: 18,
      peak: 1.58,
      workingMin: 110,
      workingMax: 140,
    },
  };

  const drivingHeat: Record<
    DrivingMode,
    number
  > = {
    conservative: 48,
    balanced: 60,
    push: 73,
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

  const gripCoefficient = (
    temperature: number,
    selected: CompoundName
  ): number => {
    const config =
      compounds[selected];

    const difference =
      temperature -
      config.optimum;

    const factor =
      Math.exp(
        -(
          difference *
          difference
        ) /
          (2 *
            config.sigma *
            config.sigma)
      );

    return (
      0.72 +
      (config.peak - 0.72) *
        factor
    );
  };

  const loadSensitivityFactor = (
    load: number
  ): number => {
    // Aproximación didáctica de sensibilidad a la carga:
    // al aumentar Fz, el coeficiente efectivo disminuye suavemente.
    return Math.pow(
      Math.max(load, 1) / 4000,
      -0.08
    );
  };

  const scaleX = (
    temperature: number
  ): number => {
    return (
      75 +
      ((temperature - 40) / 110) *
        680
    );
  };

  const scaleY = (
    mu: number
  ): number => {
    const min = 0.6;
    const max = 2;

    return (
      365 -
      ((mu - min) / (max - min)) *
        325
    );
  };

  const buildCurve =
    (): void => {
      const load = getInput(
        loadControl,
        4000
      );

      const loadFactor =
        loadSensitivityFactor(load);

      const values =
        Array.from(
          { length: 111 },
          (_, index) => {
            const temperature =
              40 + index;

            return {
              temperature,
              mu:
                gripCoefficient(
                  temperature,
                  compound
                ) * loadFactor,
            };
          }
        );

      const d = values
        .map((point, index) => {
          return `${
            index === 0 ? "M" : "L"
          } ${scaleX(
            point.temperature
          ).toFixed(2)} ${scaleY(
            point.mu
          ).toFixed(2)}`;
        })
        .join(" ");

      if (
        curve instanceof SVGPathElement
      ) {
        curve.setAttribute("d", d);
      }

      const config =
        compounds[compound];

      const lower =
        config.workingMin;

      const upper =
        config.workingMax;

      if (
        optimumWindow instanceof SVGRectElement
      ) {
        const x = scaleX(lower);
        const width =
          scaleX(upper) - x;

        optimumWindow.setAttribute(
          "x",
          String(x)
        );
        optimumWindow.setAttribute(
          "width",
          String(width)
        );
      }
    };

  const setLights = (
    mode:
      | "idle"
      | "running"
      | "done"
  ): void => {
    [light1, light2, light3].forEach(
      (light) => {
        if (light instanceof HTMLElement) {
          light.dataset.state =
            "off";
        }
      }
    );

    if (mode === "idle") {
      if (
        light1 instanceof HTMLElement
      ) {
        light1.dataset.state =
          "warm";
      }
    }

    if (mode === "running") {
      if (
        light1 instanceof HTMLElement
      ) {
        light1.dataset.state =
          "on";
      }

      if (
        light2 instanceof HTMLElement
      ) {
        light2.dataset.state =
          "on";
      }

      if (
        light3 instanceof HTMLElement
      ) {
        light3.dataset.state =
          "blink";
      }
    }

    if (mode === "done") {
      [light1, light2, light3].forEach(
        (light) => {
          if (
            light instanceof HTMLElement
          ) {
            light.dataset.state =
              "done";
          }
        }
      );
    }
  };

  const updateCarPosition = (
    ratio: number
  ): void => {
    if (!(car instanceof HTMLElement)) {
      return;
    }

    const min = 24;
    const max = 620;
    const x =
      min + (max - min) * ratio;

    const bob =
      Math.sin(
        ratio * Math.PI * 8
      ) * 3;

    car.style.transform =
      `translate(${x}px, ${bob}px)`;
  };

  const update =
    (): void => {
      const temperature =
        getInput(
          temperatureControl,
          75
        );

      const trackTemperature =
        getInput(
          trackTemperatureControl,
          35
        );

      const load = getInput(
        loadControl,
        4000
      );

      const rawMu =
        gripCoefficient(
          temperature,
          compound
        );

      const loadFactor =
        loadSensitivityFactor(load);

      const effectiveMu =
        rawMu * loadFactor;

      const force =
        effectiveMu * load;

      const config =
        compounds[compound];

      let state =
        "Ventana óptima";

      if (
        temperature <
        config.workingMin
      ) {
        state = "Neumático frío";
      }

      if (
        temperature >
        config.workingMax
      ) {
        state =
          "Sobrecalentamiento";
      }

      setText(
        "#temperature-value",
        `${temperature.toFixed(0)} °C`
      );

      setText(
        "#track-temperature-value",
        `${trackTemperature.toFixed(0)} °C`
      );

      setText(
        "#load-value",
        `${load.toFixed(0)} N`
      );

      setText(
        "#temperature-live",
        `${temperature.toFixed(1)} °C`
      );

      setText(
        "#track-live",
        `${trackTemperature.toFixed(0)} °C`
      );

      setText(
        "#mu-live",
        effectiveMu.toFixed(2)
      );

      setText(
        "#force-live",
        `${force.toFixed(0)} N`
      );

      setText(
        "#mu-current",
        effectiveMu.toFixed(2)
      );

      setText(
        "#force-current",
        `${force.toFixed(0)} N`
      );

      setText(
        "#tyre-state",
        state
      );

      setText(
        "#f1-chart-state",
        running
          ? `${state} · vuelta`
          : state
      );

      setText(
        "#tyre-temperature-hero",
        `${temperature.toFixed(1)} °C`
      );

      setText(
        "#f1-substitution",
        `F = (${effectiveMu.toFixed(
          2
        )})(${load.toFixed(0)})`
      );

      setText(
        "#f1-result",
        `F = ${force.toFixed(0)} N`
      );

      if (
        tyre instanceof HTMLElement
      ) {
        tyre.dataset.state = state;
      }

      const markerX =
        scaleX(temperature);
      const markerY =
        scaleY(effectiveMu);

      if (
        marker instanceof SVGCircleElement
      ) {
        marker.setAttribute(
          "cx",
          String(markerX)
        );
        marker.setAttribute(
          "cy",
          String(markerY)
        );
      }

      if (
        markerPulse instanceof SVGCircleElement
      ) {
        markerPulse.setAttribute(
          "cx",
          String(markerX)
        );
        markerPulse.setAttribute(
          "cy",
          String(markerY)
        );
      }

      if (
        markerGuideX instanceof SVGLineElement
      ) {
        markerGuideX.setAttribute(
          "x1",
          String(markerX)
        );
        markerGuideX.setAttribute(
          "y1",
          String(markerY)
        );
        markerGuideX.setAttribute(
          "x2",
          String(markerX)
        );
        markerGuideX.setAttribute(
          "y2",
          "365"
        );
      }

      if (
        markerGuideY instanceof SVGLineElement
      ) {
        markerGuideY.setAttribute(
          "x1",
          "75"
        );
        markerGuideY.setAttribute(
          "y1",
          String(markerY)
        );
        markerGuideY.setAttribute(
          "x2",
          String(markerX)
        );
        markerGuideY.setAttribute(
          "y2",
          String(markerY)
        );
      }

      buildCurve();
    };

  const stop =
    (): void => {
      running = false;

      cancelAnimationFrame(
        animationFrame
      );

      lastTimestamp = 0;

      setText(
        "#f1-play-icon",
        "▶"
      );

      setText(
        "#f1-play-text",
        lapTime > 0
          ? "Continuar vuelta"
          : "Simular vuelta"
      );

      setLights("idle");
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
      (timestamp -
        lastTimestamp) /
      1000;

    lastTimestamp = timestamp;
    lapTime += delta;

    const trackTemperature =
      getInput(
        trackTemperatureControl,
        35
      );

    const load = getInput(
      loadControl,
      4000
    );

    const currentTemperature =
      getInput(
        temperatureControl,
        75
      );

    const loadHeat =
      ((load - 4000) / 4000) * 7;

    const targetTemperature =
      trackTemperature +
      drivingHeat[drivingMode] +
      loadHeat;

    const response =
      1 -
      Math.exp(-delta / 5.5);

    let nextTemperature =
      currentTemperature +
      (targetTemperature -
        currentTemperature) *
        response;

    nextTemperature = Math.max(
      40,
      Math.min(150, nextTemperature)
    );

    if (
      temperatureControl instanceof HTMLInputElement
    ) {
      temperatureControl.value =
        nextTemperature.toFixed(2);
    }

    const ratio = Math.min(
      1,
      lapTime / lapDuration
    );

    setText(
      "#f1-lap-time",
      `${lapTime.toFixed(1)} s`
    );

    if (progress instanceof HTMLElement) {
      progress.style.width =
        `${ratio * 100}%`;
    }

    updateCarPosition(ratio);
    update();

    if (lapTime >= lapDuration) {
      lapTime = lapDuration;
      running = false;

      setText(
        "#f1-play-icon",
        "↻"
      );

      setText(
        "#f1-play-text",
        "Repetir vuelta"
      );

      setText(
        "#f1-chart-state",
        "Vuelta completada"
      );

      setLights("done");
      return;
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
        if (
          !running &&
          lapTime >= lapDuration
        ) {
          lapTime = 0;

          if (
            progress instanceof HTMLElement
          ) {
            progress.style.width =
              "0%";
          }

          updateCarPosition(0);
        }

        running = !running;

        if (running) {
          lastTimestamp = 0;

          setText(
            "#f1-play-icon",
            "❚❚"
          );

          setText(
            "#f1-play-text",
            "Pausar vuelta"
          );

          setLights("running");

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
    temperatureControl,
    trackTemperatureControl,
    loadControl,
  ].forEach((control) => {
    if (
      control instanceof HTMLInputElement
    ) {
      control.addEventListener(
        "input",
        () => {
          if (running) {
            stop();
          }

          update();
        }
      );
    }
  });

  root
    .querySelectorAll(
      "[data-compound]"
    )
    .forEach((button) => {
      if (
        button instanceof HTMLButtonElement
      ) {
        button.addEventListener(
          "click",
          () => {
            const value =
              button.dataset.compound;

            if (
              value === "soft" ||
              value === "medium" ||
              value === "hard"
            ) {
              compound = value;
            }

            root
              .querySelectorAll(
                "[data-compound]"
              )
              .forEach((item) => {
                item.classList.toggle(
                  "active",
                  item === button
                );
              });

            update();
          }
        );
      }
    });

  root
    .querySelectorAll(
      "[data-driving]"
    )
    .forEach((button) => {
      if (
        button instanceof HTMLButtonElement
      ) {
        button.addEventListener(
          "click",
          () => {
            const value =
              button.dataset.driving;

            if (
              value === "conservative" ||
              value === "balanced" ||
              value === "push"
            ) {
              drivingMode = value;
            }

            root
              .querySelectorAll(
                "[data-driving]"
              )
              .forEach((item) => {
                item.classList.toggle(
                  "active",
                  item === button
                );
              });
          }
        );
      }
    });

  if (
    resetButton instanceof HTMLButtonElement
  ) {
    resetButton.addEventListener(
      "click",
      () => {
        stop();

        lapTime = 0;

        if (
          temperatureControl instanceof HTMLInputElement
        ) {
          temperatureControl.value =
            "100";
        }

        if (
          trackTemperatureControl instanceof HTMLInputElement
        ) {
          trackTemperatureControl.value =
            "35";
        }

        if (
          loadControl instanceof HTMLInputElement
        ) {
          loadControl.value =
            "4000";
        }

        compound = "soft";
        drivingMode = "balanced";

        root
          .querySelectorAll(
            "[data-compound]"
          )
          .forEach((item) => {
            item.classList.toggle(
              "active",
              item instanceof
                HTMLButtonElement &&
                item.dataset.compound ===
                  "soft"
            );
          });

        root
          .querySelectorAll(
            "[data-driving]"
          )
          .forEach((item) => {
            item.classList.toggle(
              "active",
              item instanceof
                HTMLButtonElement &&
                item.dataset.driving ===
                  "balanced"
            );
          });

        if (
          progress instanceof HTMLElement
        ) {
          progress.style.width =
            "0%";
        }

        setText(
          "#f1-lap-time",
          "0.0 s"
        );

        setText(
          "#f1-play-text",
          "Simular vuelta"
        );

        setText(
          "#f1-play-icon",
          "▶"
        );

        setLights("idle");
        updateCarPosition(0);
        update();
      }
    );
  }

  setLights("idle");
  updateCarPosition(0);
  update();
}

export {};