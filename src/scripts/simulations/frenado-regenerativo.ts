const root =
  document.querySelector<HTMLElement>(
    "#regen-lab"
  );

if (root) {
  const massInput =
    document.querySelector<HTMLInputElement>(
      "#regen-mass"
    );

  const speedInput =
    document.querySelector<HTMLInputElement>(
      "#regen-speed"
    );

  const finalSpeedInput =
    document.querySelector<HTMLInputElement>(
      "#regen-final-speed"
    );

  const efficiencyInput =
    document.querySelector<HTMLInputElement>(
      "#regen-efficiency"
    );

  const massValue =
    document.querySelector<HTMLElement>(
      "#regen-mass-value"
    );

  const speedValue =
    document.querySelector<HTMLElement>(
      "#regen-speed-value"
    );

  const finalSpeedValue =
    document.querySelector<HTMLElement>(
      "#regen-final-speed-value"
    );

  const efficiencyValue =
    document.querySelector<HTMLElement>(
      "#regen-efficiency-value"
    );

  const totalEnergyOutput =
    document.querySelector<HTMLElement>(
      "#regen-total-energy"
    );

  const recoveredEnergyOutput =
    document.querySelector<HTMLElement>(
      "#regen-recovered-energy"
    );

  const lostEnergyOutput =
    document.querySelector<HTMLElement>(
      "#regen-lost-energy"
    );

  const liveSpeed =
    document.querySelector<HTMLElement>(
      "#regen-live-speed"
    );

  const liveKinetic =
    document.querySelector<HTMLElement>(
      "#regen-live-kinetic"
    );

  const liveRecovered =
    document.querySelector<HTMLElement>(
      "#regen-live-recovered"
    );

  const statusOutput =
    document.querySelector<HTMLElement>(
      "#regen-status"
    );

  const startButton =
    document.querySelector<HTMLButtonElement>(
      "#regen-start"
    );

  const resetButton =
    document.querySelector<HTMLButtonElement>(
      "#regen-reset"
    );

  const car =
    document.querySelector<HTMLElement>(
      "#regen-car"
    );

  const energyArrow =
    document.querySelector<HTMLElement>(
      "#regen-energy-arrow"
    );

  const kineticLine =
    document.querySelector<SVGPolylineElement>(
      "#regen-kinetic-line"
    );

  const recoveredLine =
    document.querySelector<SVGPolylineElement>(
      "#regen-recovered-line"
    );

  const lostLine =
    document.querySelector<SVGPolylineElement>(
      "#regen-lost-line"
    );


  let animationFrame = 0;
  let animationStart = 0;
  let running = false;

  const brakingDuration = 5;


  const kmhToMs = (
    speedKmh: number
  ): number => {
    return speedKmh / 3.6;
  };


  const kineticEnergy = (
    mass: number,
    speedMs: number
  ): number => {
    return (
      0.5 *
      mass *
      speedMs *
      speedMs
    );
  };


  const toKJ = (
    joules: number
  ): number => {
    return joules / 1000;
  };


  const formatEnergy = (
    joules: number
  ): string => {
    return `${toKJ(joules).toFixed(1)} kJ`;
  };


  const clamp = (
    value: number,
    min: number,
    max: number
  ): number => {
    return Math.min(
      Math.max(value, min),
      max
    );
  };


  const getValues = () => {
    const mass =
      Number(massInput?.value ?? 1800);

    const speed =
      Number(speedInput?.value ?? 80);

    let finalSpeed =
      Number(
        finalSpeedInput?.value ?? 20
      );

    const efficiency =
      Number(
        efficiencyInput?.value ?? 70
      ) / 100;

    if (finalSpeed > speed) {
      finalSpeed = speed;

      if (finalSpeedInput) {
        finalSpeedInput.value =
          String(speed);
      }
    }

    return {
      mass,
      speed,
      finalSpeed,
      efficiency,
    };
  };


  const calculate = () => {
    const {
      mass,
      speed,
      finalSpeed,
      efficiency,
    } = getValues();

    const initialMs =
      kmhToMs(speed);

    const finalMs =
      kmhToMs(finalSpeed);

    const initialEnergy =
      kineticEnergy(
        mass,
        initialMs
      );

    const finalEnergy =
      kineticEnergy(
        mass,
        finalMs
      );

    const availableEnergy =
      Math.max(
        initialEnergy -
          finalEnergy,
        0
      );

    const recoveredEnergy =
      availableEnergy *
      efficiency;

    const dissipatedEnergy =
      availableEnergy -
      recoveredEnergy;

    return {
      mass,
      speed,
      finalSpeed,
      efficiency,
      initialEnergy,
      finalEnergy,
      availableEnergy,
      recoveredEnergy,
      dissipatedEnergy,
    };
  };


  const buildChart = (): void => {
    if (
      !kineticLine ||
      !recoveredLine ||
      !lostLine
    ) {
      return;
    }

    const values =
      calculate();

    const widthStart = 64;
    const widthEnd = 690;

    const heightTop = 24;
    const heightBottom = 250;

    const samples = 40;

    const maxEnergy =
      Math.max(
        values.initialEnergy,
        1
      );


    const kineticPoints: string[] = [];
    const recoveredPoints: string[] = [];
    const lostPoints: string[] = [];


    for (
      let i = 0;
      i <= samples;
      i++
    ) {
      const t =
        i / samples;

      const speedNow =
        values.speed +
        (
          values.finalSpeed -
          values.speed
        ) *
          t;

      const speedNowMs =
        kmhToMs(speedNow);

      const energyNow =
        kineticEnergy(
          values.mass,
          speedNowMs
        );

      const energyRemoved =
        values.initialEnergy -
        energyNow;

      const recoveredNow =
        energyRemoved *
        values.efficiency;

      const lostNow =
        energyRemoved -
        recoveredNow;


      const x =
        widthStart +
        (
          widthEnd -
          widthStart
        ) *
          t;


      const mapY = (
        energy: number
      ): number => {
        const normalized =
          energy /
          maxEnergy;

        return (
          heightBottom -
          normalized *
            (
              heightBottom -
              heightTop
            )
        );
      };


      kineticPoints.push(
        `${x},${mapY(
          energyNow
        )}`
      );

      recoveredPoints.push(
        `${x},${mapY(
          recoveredNow
        )}`
      );

      lostPoints.push(
        `${x},${mapY(
          lostNow
        )}`
      );
    }


    kineticLine.setAttribute(
      "points",
      kineticPoints.join(" ")
    );

    recoveredLine.setAttribute(
      "points",
      recoveredPoints.join(" ")
    );

    lostLine.setAttribute(
      "points",
      lostPoints.join(" ")
    );
  };


  const updateStaticUI = (): void => {
    const values =
      calculate();

    if (massValue) {
      massValue.textContent =
        values.mass.toFixed(0);
    }

    if (speedValue) {
      speedValue.textContent =
        values.speed.toFixed(0);
    }

    if (finalSpeedValue) {
      finalSpeedValue.textContent =
        values.finalSpeed.toFixed(0);
    }

    if (efficiencyValue) {
      efficiencyValue.textContent =
        (
          values.efficiency *
          100
        ).toFixed(0);
    }

    if (totalEnergyOutput) {
      totalEnergyOutput.textContent =
        formatEnergy(
          values.availableEnergy
        );
    }

    if (recoveredEnergyOutput) {
      recoveredEnergyOutput.textContent =
        formatEnergy(
          values.recoveredEnergy
        );
    }

    if (lostEnergyOutput) {
      lostEnergyOutput.textContent =
        formatEnergy(
          values.dissipatedEnergy
        );
    }

    if (!running) {
      if (liveSpeed) {
        liveSpeed.textContent =
          `${values.speed.toFixed(
            0
          )} km/h`;
      }

      if (liveKinetic) {
        liveKinetic.textContent =
          formatEnergy(
            values.initialEnergy
          );
      }

      if (liveRecovered) {
        liveRecovered.textContent =
          "0.0 kJ";
      }
    }

    buildChart();
  };


  const stopAnimation = (): void => {
    running = false;

    cancelAnimationFrame(
      animationFrame
    );

    if (startButton) {
      startButton.disabled = false;
    }

    if (energyArrow) {
      energyArrow.classList.remove(
        "active"
      );
    }
  };


  const animate = (
    timestamp: number
  ): void => {
    const values =
      calculate();

    if (!animationStart) {
      animationStart = timestamp;
    }

    const elapsed =
      (
        timestamp -
        animationStart
      ) / 1000;

    const progress =
      clamp(
        elapsed /
          brakingDuration,
        0,
        1
      );


    const speedNow =
      values.speed +
      (
        values.finalSpeed -
        values.speed
      ) *
        progress;


    const speedNowMs =
      kmhToMs(speedNow);


    const kineticNow =
      kineticEnergy(
        values.mass,
        speedNowMs
      );


    const energyRemoved =
      values.initialEnergy -
      kineticNow;


    const recoveredNow =
      energyRemoved *
      values.efficiency;


    if (liveSpeed) {
      liveSpeed.textContent =
        `${speedNow.toFixed(
          1
        )} km/h`;
    }


    if (liveKinetic) {
      liveKinetic.textContent =
        formatEnergy(
          kineticNow
        );
    }


    if (liveRecovered) {
      liveRecovered.textContent =
        formatEnergy(
          recoveredNow
        );
    }


    if (statusOutput) {
      statusOutput.textContent =
        "Recuperando energía";
    }


    if (car) {
      const translateX =
        progress * 34;

      car.style.transform =
        `translateX(${translateX}px)`;
    }


    if (energyArrow) {
      energyArrow.classList.add(
        "active"
      );
    }


    if (progress < 1) {
      animationFrame =
        requestAnimationFrame(
          animate
        );
    } else {
      stopAnimation();

      if (statusOutput) {
        statusOutput.textContent =
          "Frenado completado";
      }

      if (car) {
        car.style.transform =
          "translateX(34px)";
      }
    }
  };


  const startAnimation = (): void => {
    stopAnimation();

    running = true;

    animationStart = 0;

    if (startButton) {
      startButton.disabled = true;
    }

    if (statusOutput) {
      statusOutput.textContent =
        "Iniciando frenado";
    }

    animationFrame =
      requestAnimationFrame(
        animate
      );
  };


  const reset = (): void => {
    stopAnimation();

    animationStart = 0;

    if (massInput) {
      massInput.value = "1800";
    }

    if (speedInput) {
      speedInput.value = "80";
    }

    if (finalSpeedInput) {
      finalSpeedInput.value = "20";
    }

    if (efficiencyInput) {
      efficiencyInput.value = "70";
    }

    if (car) {
      car.style.transform =
        "translateX(0)";
    }

    if (statusOutput) {
      statusOutput.textContent =
        "Listo para frenar";
    }

    updateStaticUI();
  };


  [
    massInput,
    speedInput,
    finalSpeedInput,
    efficiencyInput,
  ].forEach(
    (input) => {
      input?.addEventListener(
        "input",
        () => {
          stopAnimation();

          if (statusOutput) {
            statusOutput.textContent =
              "Parámetros actualizados";
          }

          updateStaticUI();
        }
      );
    }
  );


  startButton?.addEventListener(
    "click",
    startAnimation
  );


  resetButton?.addEventListener(
    "click",
    reset
  );


  updateStaticUI();
}

export {};