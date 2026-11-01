const root =
  document.querySelector<HTMLElement>(
    "#bounce-lab"
  );

if (root) {
  const restitutionInput =
    document.querySelector<HTMLInputElement>(
      "#bounce-e"
    );

  const heightInput =
    document.querySelector<HTMLInputElement>(
      "#bounce-height"
    );

  const gravityInput =
    document.querySelector<HTMLInputElement>(
      "#bounce-gravity"
    );


  const restitutionValue =
    document.querySelector<HTMLElement>(
      "#bounce-e-value"
    );

  const heightValue =
    document.querySelector<HTMLElement>(
      "#bounce-height-value"
    );

  const gravityValue =
    document.querySelector<HTMLElement>(
      "#bounce-gravity-value"
    );


  const liveE =
    document.querySelector<HTMLElement>(
      "#bounce-live-e"
    );

  const liveHeight =
    document.querySelector<HTMLElement>(
      "#bounce-live-height"
    );

  const liveCount =
    document.querySelector<HTMLElement>(
      "#bounce-live-count"
    );


  const impactSpeedOutput =
    document.querySelector<HTMLElement>(
      "#bounce-impact-speed"
    );

  const reboundSpeedOutput =
    document.querySelector<HTMLElement>(
      "#bounce-rebound-speed"
    );

  const nextHeightOutput =
    document.querySelector<HTMLElement>(
      "#bounce-next-height"
    );

  const energyOutput =
    document.querySelector<HTMLElement>(
      "#bounce-energy"
    );


  const stateOutput =
    document.querySelector<HTMLElement>(
      "#bounce-state"
    );

  const ball =
    document.querySelector<HTMLElement>(
      "#bounce-ball"
    );


  const startButton =
    document.querySelector<HTMLButtonElement>(
      "#bounce-start"
    );

  const resetButton =
    document.querySelector<HTMLButtonElement>(
      "#bounce-reset"
    );


  const presetButtons =
    document.querySelectorAll<HTMLButtonElement>(
      "[data-bounce-preset]"
    );


  let animationFrame = 0;
  let running = false;

  let lastTimestamp = 0;

  let y = 0;
  let velocity = 0;

  let bounceCount = 0;

  let initialEnergy = 1;


  const maxVisualTravel = 235;


  const clamp = (
    value: number,
    min: number,
    max: number
  ): number => {
    return Math.min(
      Math.max(
        value,
        min
      ),
      max
    );
  };


  const getValues = () => {
    return {
      e:
        Number(
          restitutionInput?.value ??
            0.7
        ),

      height:
        Number(
          heightInput?.value ??
            4
        ),

      gravity:
        Number(
          gravityInput?.value ??
            9.81
        ),
    };
  };


  const calculateImpact = () => {
    const values =
      getValues();

    const impactSpeed =
      Math.sqrt(
        2 *
          values.gravity *
          values.height
      );


    const reboundSpeed =
      values.e *
      impactSpeed;


    const nextHeight =
      (
        reboundSpeed *
        reboundSpeed
      ) /
      (
        2 *
        values.gravity
      );


    const energyRatio =
      values.e *
      values.e;


    return {
      ...values,
      impactSpeed,
      reboundSpeed,
      nextHeight,
      energyRatio,
    };
  };


  const setBallPosition = (
    heightMeters: number
  ): void => {
    if (!ball) {
      return;
    }

    const maxHeight =
      Number(
        heightInput?.max ??
          8
      );

    const ratio =
      clamp(
        heightMeters /
          maxHeight,
        0,
        1
      );


    const travel =
      ratio *
      maxVisualTravel;


    ball.style.transform =
      `translateY(${-travel}px)`;
  };


  const updateStaticUI = (): void => {
    const values =
      calculateImpact();


    if (restitutionValue) {
      restitutionValue.textContent =
        values.e.toFixed(2);
    }


    if (heightValue) {
      heightValue.textContent =
        values.height.toFixed(2);
    }


    if (gravityValue) {
      gravityValue.textContent =
        values.gravity.toFixed(2);
    }


    if (liveE) {
      liveE.textContent =
        values.e.toFixed(2);
    }


    if (liveHeight) {
      liveHeight.textContent =
        `${values.height.toFixed(
          2
        )} m`;
    }


    if (!running) {
      setBallPosition(
        values.height
      );
    }


    if (impactSpeedOutput) {
      impactSpeedOutput.textContent =
        `${values.impactSpeed.toFixed(
          2
        )} m/s`;
    }


    if (reboundSpeedOutput) {
      reboundSpeedOutput.textContent =
        `${values.reboundSpeed.toFixed(
          2
        )} m/s`;
    }


    if (nextHeightOutput) {
      nextHeightOutput.textContent =
        `${values.nextHeight.toFixed(
          2
        )} m`;
    }


    if (energyOutput) {
      energyOutput.textContent =
        `${(
          values.energyRatio *
          100
        ).toFixed(1)} %`;
    }
  };


  const stop = (): void => {
    running = false;

    cancelAnimationFrame(
      animationFrame
    );

    if (startButton) {
      startButton.disabled = false;
    }
  };


  const updateAnimation = (
    timestamp: number
  ): void => {
    if (!running) {
      return;
    }


    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }


    const dt =
      Math.min(
        (
          timestamp -
          lastTimestamp
        ) /
          1000,
        0.03
      );


    lastTimestamp =
      timestamp;


    const values =
      getValues();


    velocity -=
      values.gravity *
      dt;


    y +=
      velocity *
      dt;


    if (y <= 0) {
      y = 0;


      const impactSpeed =
        Math.abs(
          velocity
        );


      velocity =
        impactSpeed *
        values.e;


      bounceCount += 1;


      if (liveCount) {
        liveCount.textContent =
          String(
            bounceCount
          );
      }


      if (impactSpeedOutput) {
        impactSpeedOutput.textContent =
          `${impactSpeed.toFixed(
            2
          )} m/s`;
      }


      if (reboundSpeedOutput) {
        reboundSpeedOutput.textContent =
          `${velocity.toFixed(
            2
          )} m/s`;
      }


      const nextHeight =
        (
          velocity *
          velocity
        ) /
        (
          2 *
          values.gravity
        );


      if (nextHeightOutput) {
        nextHeightOutput.textContent =
          `${nextHeight.toFixed(
            2
          )} m`;
      }


      const relativeEnergy =
        initialEnergy > 0
          ? (
              nextHeight /
              Number(
                heightInput?.value ??
                  4
              )
            ) *
            100
          : 0;


      if (energyOutput) {
        energyOutput.textContent =
          `${Math.max(
            relativeEnergy,
            0
          ).toFixed(1)} %`;
      }


      if (
        velocity <
        0.35
      ) {
        stop();

        if (stateOutput) {
          stateOutput.textContent =
            "DETENIDO";
        }

        setBallPosition(0);

        return;
      }
    }


    setBallPosition(y);


    if (liveHeight) {
      liveHeight.textContent =
        `${Math.max(
          y,
          0
        ).toFixed(2)} m`;
    }


    if (stateOutput) {
      stateOutput.textContent =
        "SIMULANDO";
    }


    animationFrame =
      requestAnimationFrame(
        updateAnimation
      );
  };


  const start = (): void => {
    stop();


    const values =
      getValues();


    y =
      values.height;

    velocity = 0;

    bounceCount = 0;

    initialEnergy =
      values.height;


    lastTimestamp = 0;

    running = true;


    if (liveCount) {
      liveCount.textContent =
        "0";
    }


    if (stateOutput) {
      stateOutput.textContent =
        "SIMULANDO";
    }


    if (startButton) {
      startButton.disabled = true;
    }


    setBallPosition(y);


    animationFrame =
      requestAnimationFrame(
        updateAnimation
      );
  };


  const reset = (): void => {
    stop();


    if (restitutionInput) {
      restitutionInput.value =
        "0.70";
    }


    if (heightInput) {
      heightInput.value =
        "4";
    }


    if (gravityInput) {
      gravityInput.value =
        "9.81";
    }


    y = 4;

    velocity = 0;

    bounceCount = 0;


    if (liveCount) {
      liveCount.textContent =
        "0";
    }


    if (stateOutput) {
      stateOutput.textContent =
        "LISTO";
    }


    updateStaticUI();
  };


  const applyPreset = (
    preset: string
  ): void => {
    if (!restitutionInput) {
      return;
    }


    switch (preset) {
      case "dead":
        restitutionInput.value =
          "0.05";
        break;

      case "realistic":
        restitutionInput.value =
          "0.70";
        break;

      case "arcade":
        restitutionInput.value =
          "0.88";
        break;

      case "elastic":
        restitutionInput.value =
          "0.98";
        break;
    }


    presetButtons.forEach(
      (button) => {
        button.classList.toggle(
          "active",
          button.dataset
            .bouncePreset ===
            preset
        );
      }
    );


    stop();

    updateStaticUI();


    if (stateOutput) {
      stateOutput.textContent =
        "LISTO";
    }
  };


  [
    restitutionInput,
    heightInput,
    gravityInput,
  ].forEach(
    (input) => {
      input?.addEventListener(
        "input",
        () => {
          stop();

          updateStaticUI();

          if (stateOutput) {
            stateOutput.textContent =
              "LISTO";
          }
        }
      );
    }
  );


  presetButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          const preset =
            button.dataset
              .bouncePreset;

          if (preset) {
            applyPreset(
              preset
            );
          }
        }
      );
    }
  );


  startButton?.addEventListener(
    "click",
    start
  );


  resetButton?.addEventListener(
    "click",
    reset
  );


  updateStaticUI();
}

export {};