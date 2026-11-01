const root =
  document.querySelector<HTMLElement>(
    "#gravity-assist-lab"
  );

if (root) {
  type VoyagerView =
    | "mission"
    | "jupiter"
    | "saturn";


  interface VoyagerPoint {
    t: number;
    speed: number;
  }


  const speedLine =
    document.querySelector<SVGPolylineElement>(
      "#voyager-speed-line"
    );


  const buttons =
    document.querySelectorAll<HTMLButtonElement>(
      "[data-voyager-view]"
    );


  const liveSpeed =
    document.querySelector<HTMLElement>(
      "#assist-live-speed"
    );


  const voyager =
    document.querySelector<HTMLElement>(
      "#assist-voyager"
    );


  const jupiterMarker =
    document.querySelector<SVGGElement>(
      "#voyager-jupiter-marker"
    );


  const saturnMarker =
    document.querySelector<SVGGElement>(
      "#voyager-saturn-marker"
    );


  /*
    Reconstrucción didáctica.

    No pretende ser telemetría continua exacta.
    La intención es representar la tendencia
    heliocéntrica alrededor de los encuentros.
  */

  const missionData: VoyagerPoint[] = [
    {
      t: 0.00,
      speed: 38.0,
    },
    {
      t: 0.10,
      speed: 37.2,
    },
    {
      t: 0.20,
      speed: 35.8,
    },
    {
      t: 0.30,
      speed: 34.6,
    },
    {
      t: 0.38,
      speed: 34.1,
    },

    /*
      Encuentro con Júpiter.
      Se representa un cambio notable
      en la rapidez heliocéntrica.
    */

    {
      t: 0.44,
      speed: 39.5,
    },
    {
      t: 0.50,
      speed: 40.4,
    },
    {
      t: 0.58,
      speed: 39.6,
    },
    {
      t: 0.66,
      speed: 38.4,
    },

    /*
      Encuentro con Saturno.
    */

    {
      t: 0.74,
      speed: 40.8,
    },
    {
      t: 0.80,
      speed: 41.3,
    },
    {
      t: 0.88,
      speed: 40.1,
    },
    {
      t: 1.00,
      speed: 39.0,
    },
  ];


  const jupiterData: VoyagerPoint[] = [
    {
      t: 0.00,
      speed: 34.4,
    },
    {
      t: 0.20,
      speed: 34.1,
    },
    {
      t: 0.40,
      speed: 34.8,
    },
    {
      t: 0.55,
      speed: 37.0,
    },
    {
      t: 0.68,
      speed: 39.5,
    },
    {
      t: 0.80,
      speed: 40.4,
    },
    {
      t: 1.00,
      speed: 39.6,
    },
  ];


  const saturnData: VoyagerPoint[] = [
    {
      t: 0.00,
      speed: 38.5,
    },
    {
      t: 0.20,
      speed: 38.3,
    },
    {
      t: 0.40,
      speed: 38.7,
    },
    {
      t: 0.58,
      speed: 39.6,
    },
    {
      t: 0.72,
      speed: 40.8,
    },
    {
      t: 0.84,
      speed: 41.3,
    },
    {
      t: 1.00,
      speed: 40.2,
    },
  ];


  const minSpeed = 30;
  const maxSpeed = 44;


  const chartLeft = 75;
  const chartRight = 810;

  const chartTop = 30;
  const chartBottom = 325;


  const mapPoint = (
    point: VoyagerPoint
  ): string => {
    const x =
      chartLeft +
      point.t *
        (
          chartRight -
          chartLeft
        );


    const normalized =
      (
        point.speed -
        minSpeed
      ) /
      (
        maxSpeed -
        minSpeed
      );


    const y =
      chartBottom -
      normalized *
        (
          chartBottom -
          chartTop
        );


    return `${x},${y}`;
  };


  const drawData = (
    data: VoyagerPoint[]
  ): void => {
    if (!speedLine) {
      return;
    }


    const points =
      data
        .map(mapPoint)
        .join(" ");


    speedLine.setAttribute(
      "points",
      points
    );
  };


  const setView = (
    view: VoyagerView
  ): void => {
    buttons.forEach(
      (button) => {
        button.classList.toggle(
          "active",
          button.dataset
            .voyagerView ===
            view
        );
      }
    );


    switch (view) {
      case "mission":
        drawData(
          missionData
        );

        if (liveSpeed) {
          liveSpeed.textContent =
            "Misión completa · Júpiter + Saturno";
        }

        if (jupiterMarker) {
          jupiterMarker.style.display =
            "";
        }

        if (saturnMarker) {
          saturnMarker.style.display =
            "";
        }

        if (voyager) {
          voyager.style.transform =
            "translate(0, 0)";
        }

        break;


      case "jupiter":
        drawData(
          jupiterData
        );

        if (liveSpeed) {
          liveSpeed.textContent =
            "Encuentro con Júpiter · 5 marzo 1979";
        }

        if (jupiterMarker) {
          jupiterMarker.style.display =
            "";
        }

        if (saturnMarker) {
          saturnMarker.style.display =
            "none";
        }

        if (voyager) {
          voyager.style.transform =
            "translate(25px, -15px)";
        }

        break;


      case "saturn":
        drawData(
          saturnData
        );

        if (liveSpeed) {
          liveSpeed.textContent =
            "Encuentro con Saturno · 12 noviembre 1980";
        }

        if (jupiterMarker) {
          jupiterMarker.style.display =
            "none";
        }

        if (saturnMarker) {
          saturnMarker.style.display =
            "";
        }

        if (voyager) {
          voyager.style.transform =
            "translate(50px, -35px)";
        }

        break;
    }
  };


  buttons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          const value =
            button.dataset
              .voyagerView;


          if (
            value ===
              "mission" ||
            value ===
              "jupiter" ||
            value ===
              "saturn"
          ) {
            setView(
              value
            );
          }
        }
      );
    }
  );


  setView(
    "mission"
  );
}

export {};