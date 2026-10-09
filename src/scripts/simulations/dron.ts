type DroneParams = {
  vx: number;
  vy: number;
  ampX: number;
  ampY: number;
  duration: number;
};

type DroneState = {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  speed: number;
  acceleration: number;
};

type Bounds = {
  min: number;
  max: number;
};

type Point = {
  x: number;
  y: number;
};

const root =
  document.querySelector("#drone-lab");

if (root instanceof HTMLElement) {
  const vxControl =
    root.querySelector("#vx-control");

  const vyControl =
    root.querySelector("#vy-control");

  const axControl =
    root.querySelector("#ax-control");

  const ayControl =
    root.querySelector("#ay-control");

  const durationControl =
    root.querySelector("#duration-control");

  const flightButton =
    root.querySelector("#flight-button");

  const resetButton =
    root.querySelector("#drone-reset");

  const routePath =
    root.querySelector("#route-path");

  const routeShadow =
    root.querySelector("#route-shadow");

  const routeStart =
    root.querySelector("#route-start");

  const routeEnd =
    root.querySelector("#route-end");

  const routeDrone =
    root.querySelector("#route-drone");

  const positionXPath =
    root.querySelector("#position-x-path");

  const positionYPath =
    root.querySelector("#position-y-path");

  const velocityXPath =
    root.querySelector("#velocity-x-path");

  const velocityYPath =
    root.querySelector("#velocity-y-path");

  const velocityMagPath =
    root.querySelector("#velocity-mag-path");

  const accelerationXPath =
    root.querySelector("#acceleration-x-path");

  const accelerationYPath =
    root.querySelector("#acceleration-y-path");

  const positionXMarker =
    root.querySelector("#position-x-marker");

  const positionYMarker =
    root.querySelector("#position-y-marker");

  const velocityMarker =
    root.querySelector("#velocity-marker");

  const accelerationMarker =
    root.querySelector("#acceleration-marker");

  let animationFrame = 0;
  let running = false;
  let startTimestamp = 0;
  let currentTime = 0;

  const getNumber = (
    element: Element | null,
    fallback: number
  ): number => {
    if (
      element instanceof HTMLInputElement
    ) {
      const value =
        Number(element.value);

      return Number.isFinite(value)
        ? value
        : fallback;
    }

    return fallback;
  };

  const getParameters =
    (): DroneParams => ({
      vx:
        getNumber(
          vxControl,
          0.85
        ),

      vy:
        getNumber(
          vyControl,
          0.45
        ),

      ampX:
        getNumber(
          axControl,
          1.2
        ),

      ampY:
        getNumber(
          ayControl,
          2.6
        ),

      duration:
        getNumber(
          durationControl,
          24
        ),
    });

  const stateAt = (
    t: number,
    params: DroneParams
  ): DroneState => {
    const x =
      params.vx * t +
      params.ampX *
        Math.sin(t / 3);

    const y =
      4 +
      params.vy * t +
      params.ampY *
        Math.sin(t / 4);

    const vx =
      params.vx +
      (params.ampX / 3) *
        Math.cos(t / 3);

    const vy =
      params.vy +
      (params.ampY / 4) *
        Math.cos(t / 4);

    const ax =
      -(params.ampX / 9) *
      Math.sin(t / 3);

    const ay =
      -(params.ampY / 16) *
      Math.sin(t / 4);

    const speed =
      Math.sqrt(
        vx * vx +
        vy * vy
      );

    const acceleration =
      Math.sqrt(
        ax * ax +
        ay * ay
      );

    return {
      t,
      x,
      y,
      vx,
      vy,
      ax,
      ay,
      speed,
      acceleration,
    };
  };

  const sampleData = (
    params: DroneParams,
    count = 101
  ): DroneState[] => {
    return Array.from(
      {
        length: count,
      },
      (_, index) => {
        const t =
          params.duration *
          index /
          (count - 1);

        return stateAt(
          t,
          params
        );
      }
    );
  };

  const computeBounds = (
    values: number[],
    paddingRatio = 0.12
  ): Bounds => {
    let min =
      Math.min(
        ...values
      );

    let max =
      Math.max(
        ...values
      );

    if (min === max) {
      min -= 1;
      max += 1;
    }

    const range =
      max - min;

    return {
      min:
        min -
        range *
          paddingRatio,

      max:
        max +
        range *
          paddingRatio,
    };
  };

  const makePath = (
    data: DroneState[],
    getter:
      (
        point: DroneState
      ) => number,
    min: number,
    max: number
  ): string => {
    const width = 820;
    const height = 320;

    const left = 65;
    const right = 30;
    const top = 30;
    const bottom = 50;

    const usableWidth =
      width -
      left -
      right;

    const usableHeight =
      height -
      top -
      bottom;

    return data
      .map(
        (
          point,
          index
        ) => {
          const x =
            left +
            index /
              (data.length - 1) *
              usableWidth;

          const value =
            getter(point);

          const normalized =
            (value - min) /
            (max - min || 1);

          const y =
            height -
            bottom -
            normalized *
              usableHeight;

          return `${
            index === 0
              ? "M"
              : "L"
          } ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
      )
      .join(" ");
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

  const updateControlLabels = (
    params: DroneParams
  ): void => {
    setText(
      "#vx-value",
      `${params.vx.toFixed(2)} m/s`
    );

    setText(
      "#vy-value",
      `${params.vy.toFixed(2)} m/s`
    );

    setText(
      "#ax-value",
      `${params.ampX.toFixed(2)} m`
    );

    setText(
      "#ay-value",
      `${params.ampY.toFixed(2)} m`
    );

    setText(
      "#duration-value",
      `${params.duration.toFixed(0)} s`
    );
  };

  const routeCoordinates = (
    point: Point,
    xBounds: Bounds,
    yBounds: Bounds
  ): Point => {
    const left = 70;
    const right = 55;
    const top = 50;
    const bottom = 70;

    const width = 720;
    const height = 430;

    const x =
      left +
      (
        point.x -
        xBounds.min
      ) /
      (
        xBounds.max -
        xBounds.min
      ) *
      (
        width -
        left -
        right
      );

    const y =
      height -
      bottom -
      (
        point.y -
        yBounds.min
      ) /
      (
        yBounds.max -
        yBounds.min
      ) *
      (
        height -
        top -
        bottom
      );

    return {
      x,
      y,
    };
  };

  const updateMarker = (
    marker: Element | null,
    x: number,
    y: number
  ): void => {
    if (
      marker instanceof SVGCircleElement
    ) {
      marker.setAttribute(
        "cx",
        String(x)
      );

      marker.setAttribute(
        "cy",
        String(y)
      );
    }
  };

  const updateAll =
    (): void => {
      const params =
        getParameters();

      updateControlLabels(
        params
      );

      currentTime =
        Math.min(
          currentTime,
          params.duration
        );

      const data =
        sampleData(
          params
        );

      const xBounds =
        computeBounds(
          data.map(
            (point) =>
              point.x
          )
        );

      const yBounds =
        computeBounds(
          data.map(
            (point) =>
              point.y
          )
        );

      const routeD =
        data
          .map(
            (
              point,
              index
            ) => {
              const position =
                routeCoordinates(
                  point,
                  xBounds,
                  yBounds
                );

              return `${
                index === 0
                  ? "M"
                  : "L"
              } ${position.x.toFixed(2)} ${position.y.toFixed(2)}`;
            }
          )
          .join(" ");

      if (
        routePath instanceof SVGPathElement
      ) {
        routePath.setAttribute(
          "d",
          routeD
        );
      }

      if (
        routeShadow instanceof SVGPathElement
      ) {
        routeShadow.setAttribute(
          "d",
          routeD
        );
      }

      const first =
        routeCoordinates(
          data[0],
          xBounds,
          yBounds
        );

      const last =
        routeCoordinates(
          data[data.length - 1],
          xBounds,
          yBounds
        );

      updateMarker(
        routeStart,
        first.x,
        first.y
      );

      updateMarker(
        routeEnd,
        last.x,
        last.y
      );

      const positionBounds =
        computeBounds([
          ...data.map(
            (point) =>
              point.x
          ),

          ...data.map(
            (point) =>
              point.y
          ),
        ]);

      const velocityBounds =
        computeBounds([
          0,

          ...data.map(
            (point) =>
              point.vx
          ),

          ...data.map(
            (point) =>
              point.vy
          ),

          ...data.map(
            (point) =>
              point.speed
          ),
        ]);

      const accelerationBounds =
        computeBounds([
          ...data.map(
            (point) =>
              point.ax
          ),

          ...data.map(
            (point) =>
              point.ay
          ),
        ]);

      const setPath = (
        element: Element | null,
        getter:
          (
            point: DroneState
          ) => number,
        bounds: Bounds
      ): void => {
        if (
          element instanceof SVGPathElement
        ) {
          element.setAttribute(
            "d",
            makePath(
              data,
              getter,
              bounds.min,
              bounds.max
            )
          );
        }
      };

      setPath(
        positionXPath,
        (point) => point.x,
        positionBounds
      );

      setPath(
        positionYPath,
        (point) => point.y,
        positionBounds
      );

      setPath(
        velocityXPath,
        (point) => point.vx,
        velocityBounds
      );

      setPath(
        velocityYPath,
        (point) => point.vy,
        velocityBounds
      );

      setPath(
        velocityMagPath,
        (point) => point.speed,
        velocityBounds
      );

      setPath(
        accelerationXPath,
        (point) => point.ax,
        accelerationBounds
      );

      setPath(
        accelerationYPath,
        (point) => point.ay,
        accelerationBounds
      );

      const liveState =
        stateAt(
          currentTime,
          params
        );

      const routeLive =
        routeCoordinates(
          liveState,
          xBounds,
          yBounds
        );

      if (
        routeDrone instanceof SVGGElement
      ) {
        routeDrone.setAttribute(
          "transform",
          `translate(${routeLive.x} ${routeLive.y})`
        );
      }

      const ratio =
        params.duration > 0
          ? currentTime /
            params.duration
          : 0;

      const chartX =
        65 +
        ratio *
          (
            820 -
            65 -
            30
          );

      const chartY = (
        value: number,
        bounds: Bounds
      ): number => {
        const height = 320;
        const top = 30;
        const bottom = 50;

        return (
          height -
          bottom -
          (
            value -
            bounds.min
          ) /
            (
              bounds.max -
              bounds.min
            ) *
            (
              height -
              top -
              bottom
            )
        );
      };

      updateMarker(
        positionXMarker,
        chartX,
        chartY(
          liveState.x,
          positionBounds
        )
      );

      updateMarker(
        positionYMarker,
        chartX,
        chartY(
          liveState.y,
          positionBounds
        )
      );

      updateMarker(
        velocityMarker,
        chartX,
        chartY(
          liveState.speed,
          velocityBounds
        )
      );

      const accelerationValue =
        Math.max(
          accelerationBounds.min,
          Math.min(
            accelerationBounds.max,
            liveState.acceleration
          )
        );

      updateMarker(
        accelerationMarker,
        chartX,
        chartY(
          accelerationValue,
          accelerationBounds
        )
      );

      setText(
        "#live-time",
        `${liveState.t.toFixed(2)} s`
      );

      setText(
        "#live-x",
        `${liveState.x.toFixed(2)} m`
      );

      setText(
        "#live-y",
        `${liveState.y.toFixed(2)} m`
      );

      setText(
        "#live-v",
        `${liveState.speed.toFixed(2)} m/s`
      );

      setText(
        "#live-a",
        `${liveState.acceleration.toFixed(3)} m/s²`
      );

      setText(
        "#hero-time",
        `${liveState.t.toFixed(1)} s`
      );

      setText(
        "#hero-speed",
        `${liveState.speed.toFixed(2)} m/s`
      );

      setText(
        "#hero-acceleration",
        `${liveState.acceleration.toFixed(3)} m/s²`
      );

      setText(
        "#flight-progress",
        `${Math.round(ratio * 100)} %`
      );

      setText(
        "#equation-x",
        `x(${liveState.t.toFixed(2)}) = ${liveState.x.toFixed(2)} m`
      );

      setText(
        "#equation-y",
        `y(${liveState.t.toFixed(2)}) = ${liveState.y.toFixed(2)} m`
      );

      setText(
        "#equation-v",
        `|v| = ${liveState.speed.toFixed(2)} m/s`
      );

      setText(
        "#equation-a",
        `|a| = ${liveState.acceleration.toFixed(3)} m/s²`
      );
    };

  const stopAnimation =
    (): void => {
      running = false;

      cancelAnimationFrame(
        animationFrame
      );

      setText(
        "#flight-button-icon",
        "▶"
      );

      setText(
        "#flight-button-text",
        currentTime > 0
          ? "Continuar vuelo"
          : "Iniciar vuelo"
      );

      setText(
        "#hero-status",
        currentTime > 0
          ? "Vuelo en pausa"
          : "Listo para despegar"
      );
    };

  const animate = (
    timestamp: number
  ): void => {
    if (!running) {
      return;
    }

    const params =
      getParameters();

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
      params.duration
    ) {
      currentTime =
        params.duration;

      updateAll();

      running = false;

      setText(
        "#flight-button-icon",
        "↻"
      );

      setText(
        "#flight-button-text",
        "Repetir vuelo"
      );

      setText(
        "#hero-status",
        "Entrega completada"
      );

      return;
    }

    updateAll();

    animationFrame =
      requestAnimationFrame(
        animate
      );
  };

  if (
    flightButton instanceof HTMLButtonElement
  ) {
    flightButton.addEventListener(
      "click",
      () => {
        const params =
          getParameters();

        if (
          !running &&
          currentTime >=
            params.duration
        ) {
          currentTime = 0;
        }

        running =
          !running;

        if (running) {
          startTimestamp = 0;

          setText(
            "#flight-button-icon",
            "❚❚"
          );

          setText(
            "#flight-button-text",
            "Pausar vuelo"
          );

          setText(
            "#hero-status",
            "Dron en ruta"
          );

          animationFrame =
            requestAnimationFrame(
              animate
            );
        } else {
          stopAnimation();
        }
      }
    );
  }

  const controls:
    Array<Element | null> = [
      vxControl,
      vyControl,
      axControl,
      ayControl,
      durationControl,
    ];

  controls.forEach(
    (control) => {
      if (
        control instanceof HTMLInputElement
      ) {
        control.addEventListener(
          "input",
          () => {
            stopAnimation();

            updateAll();
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
          vxControl instanceof HTMLInputElement
        ) {
          vxControl.value =
            "0.85";
        }

        if (
          vyControl instanceof HTMLInputElement
        ) {
          vyControl.value =
            "0.45";
        }

        if (
          axControl instanceof HTMLInputElement
        ) {
          axControl.value =
            "1.20";
        }

        if (
          ayControl instanceof HTMLInputElement
        ) {
          ayControl.value =
            "2.60";
        }

        if (
          durationControl instanceof HTMLInputElement
        ) {
          durationControl.value =
            "24";
        }

        stopAnimation();

        currentTime = 0;
        startTimestamp = 0;

        setText(
          "#hero-status",
          "Listo para despegar"
        );

        updateAll();
      }
    );
  }

  updateAll();
}