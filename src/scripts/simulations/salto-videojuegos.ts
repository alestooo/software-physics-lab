type JumpParams = {
  impulse: number;
  gravity: number;
  horizontal: number;
};

type JumpResults = {
  apexTime: number;
  airTime: number;
  maxHeight: number;
  distance: number;
};

type JumpState = {
  x: number;
  y: number;
  vy: number;
};

const root =
  document.querySelector(
    "#jump-lab"
  );

if (root instanceof HTMLElement) {
  const impulseInput =
    root.querySelector(
      "#jump-impulse"
    );

  const gravityInput =
    root.querySelector(
      "#jump-gravity"
    );

  const horizontalInput =
    root.querySelector(
      "#jump-horizontal"
    );

  const jumpButton =
    root.querySelector(
      "#jump-main-button"
    );

  const resetButton =
    root.querySelector(
      "#jump-reset"
    );

  const jumpPath =
    root.querySelector(
      "#jump-path"
    );

  const jumpPathShadow =
    root.querySelector(
      "#jump-path-shadow"
    );

  const jumpCharacter =
    root.querySelector(
      "#jump-character"
    );

  const apexMarker =
    root.querySelector(
      "#jump-apex"
    );

  let running = false;
  let animationFrame = 0;
  let startTimestamp = 0;
  let currentTime = 0;

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
      const parsed =
        Number(
          element.value
        );

      return Number.isFinite(
        parsed
      )
        ? parsed
        : fallback;
    }

    return fallback;
  };

  const parameters =
    (): JumpParams => ({
      impulse:
        getValue(
          impulseInput,
          12
        ),

      gravity:
        getValue(
          gravityInput,
          18
        ),

      horizontal:
        getValue(
          horizontalInput,
          4
        ),
    });

  const calculateResults = (
    params: JumpParams
  ): JumpResults => {
    const apexTime =
      params.impulse /
      params.gravity;

    const airTime =
      2 *
      params.impulse /
      params.gravity;

    const maxHeight =
      params.impulse *
      params.impulse /
      (
        2 *
        params.gravity
      );

    const distance =
      params.horizontal *
      airTime;

    return {
      apexTime,
      airTime,
      maxHeight,
      distance,
    };
  };

  const stateAt = (
    t: number,
    params: JumpParams
  ): JumpState => {
    const x =
      params.horizontal *
      t;

    const rawY =
      params.impulse *
        t -
      0.5 *
        params.gravity *
        t *
        t;

    const y =
      Math.max(
        0,
        rawY
      );

    const vy =
      params.impulse -
      params.gravity *
        t;

    return {
      x,
      y,
      vy,
    };
  };

  const updatePresetState = (
    gravity: number
  ): void => {
    root
      .querySelectorAll(
        "[data-gravity]"
      )
      .forEach(
        (button) => {
          if (
            button instanceof HTMLButtonElement
          ) {
            const preset =
              Number(
                button.dataset.gravity
              );

            button.classList.toggle(
              "active",
              Math.abs(
                preset -
                gravity
              ) < 0.01
            );
          }
        }
      );
  };

  const updateStatic =
    (): void => {
      const params =
        parameters();

      const results =
        calculateResults(
          params
        );

      currentTime =
        Math.min(
          currentTime,
          results.airTime
        );

      setText(
        "#jump-impulse-value",
        `${params.impulse.toFixed(1)} m/s`
      );

      setText(
        "#jump-gravity-value",
        `${params.gravity.toFixed(1)} m/s²`
      );

      setText(
        "#jump-horizontal-value",
        `${params.horizontal.toFixed(1)} m/s`
      );

      setText(
        "#hero-gravity",
        `${params.gravity.toFixed(1)} m/s²`
      );

      setText(
        "#hero-height",
        `${results.maxHeight.toFixed(2)} m`
      );

      setText(
        "#hero-air-time",
        `${results.airTime.toFixed(2)} s`
      );

      setText(
        "#result-height",
        `${results.maxHeight.toFixed(2)} m`
      );

      setText(
        "#result-apex-time",
        `${results.apexTime.toFixed(2)} s`
      );

      setText(
        "#result-air-time",
        `${results.airTime.toFixed(2)} s`
      );

      setText(
        "#result-distance",
        `${results.distance.toFixed(2)} m`
      );

      const earthHeight =
        params.impulse *
        params.impulse /
        (
          2 *
          9.81
        );

      const earthTime =
        2 *
        params.impulse /
        9.81;

      setText(
        "#earth-height",
        `${earthHeight.toFixed(2)} m`
      );

      setText(
        "#earth-time",
        `${earthTime.toFixed(2)} s`
      );

      setText(
        "#current-gravity-table",
        params.gravity.toFixed(1)
      );

      setText(
        "#current-height-table",
        `${results.maxHeight.toFixed(2)} m`
      );

      setText(
        "#current-time-table",
        `${results.airTime.toFixed(2)} s`
      );

      updatePresetState(
        params.gravity
      );

      const samples = 100;

      const left = 80;
      const right = 55;
      const top = 60;
      const ground = 370;

      const width = 840;

      const maxX =
        Math.max(
          results.distance,
          1
        );

      const maxY =
        Math.max(
          results.maxHeight,
          1
        );

      const scaleX = (
        value: number
      ): number => {
        return (
          left +
          value /
            maxX *
            (
              width -
              left -
              right
            )
        );
      };

      const scaleY = (
        value: number
      ): number => {
        return (
          ground -
          value /
            maxY *
            (
              ground -
              top
            )
        );
      };

      const points:
        Array<
          JumpState & {
            t: number;
          }
        > =
        Array.from(
          {
            length:
              samples + 1,
          },
          (
            _,
            index
          ) => {
            const t =
              results.airTime *
              index /
              samples;

            const state =
              stateAt(
                t,
                params
              );

            return {
              t,
              ...state,
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
              } ${scaleX(point.x).toFixed(2)} ${scaleY(point.y).toFixed(2)}`;
            }
          )
          .join(" ");

      if (
        jumpPath instanceof SVGPathElement
      ) {
        jumpPath.setAttribute(
          "d",
          d
        );
      }

      if (
        jumpPathShadow instanceof SVGPathElement
      ) {
        jumpPathShadow.setAttribute(
          "d",
          d
        );
      }

      const apexState =
        stateAt(
          results.apexTime,
          params
        );

      if (
        apexMarker instanceof SVGCircleElement
      ) {
        apexMarker.setAttribute(
          "cx",
          String(
            scaleX(
              apexState.x
            )
          )
        );

        apexMarker.setAttribute(
          "cy",
          String(
            scaleY(
              apexState.y
            )
          )
        );
      }

      const state =
        stateAt(
          currentTime,
          params
        );

      if (
        jumpCharacter instanceof SVGGElement
      ) {
        jumpCharacter.setAttribute(
          "transform",
          `translate(${scaleX(state.x)} ${scaleY(state.y) - 20})`
        );
      }

      setText(
        "#jump-time",
        `t = ${currentTime.toFixed(2)} s`
      );

      setText(
        "#live-jump-height",
        `${state.y.toFixed(2)} m`
      );

      setText(
        "#live-jump-vy",
        `${state.vy.toFixed(2)} m/s`
      );

      setText(
        "#live-jump-distance",
        `${state.x.toFixed(2)} m`
      );

      let phase =
        "Inicio";

      if (
        currentTime > 0 &&
        currentTime <
          results.apexTime
      ) {
        phase =
          "Ascenso";
      }

      if (
        currentTime >=
          results.apexTime &&
        currentTime <
          results.airTime
      ) {
        phase =
          "Descenso";
      }

      if (
        currentTime >=
        results.airTime
      ) {
        phase =
          "Suelo";
      }

      setText(
        "#live-jump-phase",
        phase
      );

      setText(
        "#jump-equation-live",
        `y(${currentTime.toFixed(2)}) = (${params.impulse.toFixed(2)})(${currentTime.toFixed(2)}) − ½(${params.gravity.toFixed(2)})(${currentTime.toFixed(2)})² = ${state.y.toFixed(2)} m`
      );
    };

  const stop =
    (): void => {
      running = false;

      cancelAnimationFrame(
        animationFrame
      );

      setText(
        "#jump-main-icon",
        "▲"
      );

      setText(
        "#jump-main-text",
        currentTime > 0
          ? "Continuar"
          : "Saltar"
      );

      setText(
        "#jump-status",
        currentTime > 0
          ? "Simulación en pausa"
          : "Listo"
      );
    };

  const animate = (
    timestamp: number
  ): void => {
    if (!running) {
      return;
    }

    const params =
      parameters();

    const results =
      calculateResults(
        params
      );

    if (!startTimestamp) {
      startTimestamp =
        timestamp -
        currentTime *
          1000;
    }

    currentTime =
      (
        timestamp -
        startTimestamp
      ) /
      1000;

    if (
      currentTime >=
      results.airTime
    ) {
      currentTime =
        results.airTime;

      updateStatic();

      running = false;

      setText(
        "#jump-main-icon",
        "↻"
      );

      setText(
        "#jump-main-text",
        "Repetir salto"
      );

      setText(
        "#jump-status",
        "Personaje en el suelo"
      );

      return;
    }

    updateStatic();

    animationFrame =
      requestAnimationFrame(
        animate
      );
  };

  if (
    jumpButton instanceof HTMLButtonElement
  ) {
    jumpButton.addEventListener(
      "click",
      () => {
        const params =
          parameters();

        const results =
          calculateResults(
            params
          );

        if (
          !running &&
          currentTime >=
            results.airTime
        ) {
          currentTime = 0;
        }

        running =
          !running;

        if (running) {
          startTimestamp = 0;

          setText(
            "#jump-main-icon",
            "❚❚"
          );

          setText(
            "#jump-main-text",
            "Pausar"
          );

          setText(
            "#jump-status",
            "Simulando salto"
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

  const inputs:
    Array<Element | null> = [
      impulseInput,
      gravityInput,
      horizontalInput,
    ];

  inputs.forEach(
    (input) => {
      if (
        input instanceof HTMLInputElement
      ) {
        input.addEventListener(
          "input",
          () => {
            stop();

            currentTime = 0;
            startTimestamp = 0;

            updateStatic();
          }
        );
      }
    }
  );

  root
    .querySelectorAll(
      "[data-gravity]"
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
                gravityInput instanceof HTMLInputElement
              ) {
                gravityInput.value =
                  button.dataset.gravity ??
                  "18";
              }

              stop();

              currentTime = 0;
              startTimestamp = 0;

              updateStatic();
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
          impulseInput instanceof HTMLInputElement
        ) {
          impulseInput.value =
            "12";
        }

        if (
          gravityInput instanceof HTMLInputElement
        ) {
          gravityInput.value =
            "18";
        }

        if (
          horizontalInput instanceof HTMLInputElement
        ) {
          horizontalInput.value =
            "4";
        }

        stop();

        currentTime = 0;
        startTimestamp = 0;

        setText(
          "#jump-status",
          "Listo"
        );

        updateStatic();
      }
    );
  }

  updateStatic();
}

export {};