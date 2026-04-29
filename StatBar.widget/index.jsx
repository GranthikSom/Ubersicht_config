import { css, run, React } from "uebersicht";
import * as config from "./config.json";

export const refreshFrequency = 10000;

// get the current screen resolution
const screenWidth = window.screen.width;
const barWidth = screenWidth - 100; // leave some space on the right for other widgets

const options = {
  top: "10px",
  
  left: "10px",
  right:  barWidth + "10px",
  width: screenWidth / 2 - barWidth / 2 + "px",

  // Refer to https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  timezone: "India/Kolkata",
  city: "Jaipur,IN",

  disk: "/dev/disk3s5" // the disk to monitor
};

let lastWeatherUpdate = 0;
let weatherFetched = false;

export const command = dispatch => {
  run("StatBar.widget/mini-bar-stats.sh " + options.timezone + " " + options.disk).then(output => {
    // parse the output as JSON
    const stats = JSON.parse(output);
    dispatch(
      {
        type: "UPDATE_STATS",
        data: stats
      }
    )
  })

  const now = Date.now();
  if ((now - lastWeatherUpdate >= 60000) || !weatherFetched) {
    lastWeatherUpdate = Date.now();

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${options.city}&units=metric&appid=${config.OPENWEATHERMAP_APIKEY}`
    ).then(response => {
      return response.json();
    }).then(data => {
      return dispatch({
        type: "WEATHER_UPDATE",
        data: {
          weather: {
            temp: data.main.temp.toFixed(0),
            forecast: data.weather[0].main
          },
        },
      });
    }).catch(() => {
      return dispatch({
        type: "WEATHER_UPDATE",
        data: {
          weather: {
            temp: "...",
            forecast: "..."
          }
        }
      })
    });
  }
};

export const className = {
  top: "10px",
  left: "10px",
  bottom: "10px",
  width: options.width,
  userSelect: "none",

  backgroundColor: "rgba(140, 51, 152, 0.42)",
   border: "2px solid #d887e1b5",
  padding: "4px",
  boxSizing: "border-box",
  borderRadius: "5px",
};

const containerClassName = css({
  color: "rgba(255, 255, 255)",
  fontFamily: "Source Code Pro",
  fontSize: "13px",
  textAlign: "center",
});

const red = css({
  color: "#EF233C",
});

const green = css({
  color: "#3BCA2B",
});

const blue = css({
  color: "#5DADE2",
});

const yellow = css({
  color: "#ffff00",
});

const orange = css({
  color: "#FF8C00",
});

const metricStyle = css({
  display: "inline-block",
  border: "1px solid #36454F",
  padding: "2px 10px",
  borderRadius: "5px",
  // add a shadow
  boxShadow: "0 0 3px rgba(0, 0, 0, 1)",
});

const metricsStyle = css({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "10px",
});

const metricsStyleColumn = css({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "10px",
});

const verticalSeparator = css({
  display: "inline-block",
  width: "1px",
  height: "10px",
  backgroundColor: "#923c9e"
});

export const initialState = {
  day: "...",
  month: "...",
  dayNum: "...",
  year: "...",
  time: "...",
  ampm: "...",
  cpuUsage: 0,
  memoryUsage: 0,
  disk: 0,
  wifi: {
    ssid: "N/A",
    speed: "N/A"
  },
  weather: {
    temp: "...",
    forecast: "..."
  },
  workspace: "...",
  runningApps: []
}

export const updateState = (event, previousState) => {
  if (event.error) {
    return { ...previousState, warning: `We got an error: ${event.error}` };
  }

  if (event.type === "UPDATE_STATS") {
    const runningApps = event.data.running_apps ? event.data.running_apps.split(",").filter(Boolean) : [];
    return {
      ...previousState,
      day: event.data.date_day,
      month: event.data.date_month,
      dayNum: event.data.date_day_num,
      year: event.data.date_year,
      time: event.data.date_time,
      ampm: event.data.date_ampm.toLowerCase(),
      cpuUsage: event.data.cpu_usage,
      memoryUsage: event.data.mem_usage,
      disk: event.data.disk_usage,
      wifi: {
        ssid: event.data.ssid,
        speed: event.data.wifi_speed
      },
      workspace: event.data.workspace,
      runningApps
    }
  }

  if (event.type === "WEATHER_UPDATE") {
    weatherFetched = true;
    return {
      ...previousState,
      weather: event.data.weather
    }
  }

  return {
    ...previousState,
    warning: false,
  };
};

export const render = ({ warning, day, month, dayNum, year, time, ampm, cpuUsage, memoryUsage, wifi, disk, weather, workspace, runningApps }) => {
  if (warning) {
    return <div>{warning}</div>;
  }
  return (
    <div className={containerClassName}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css"
        integrity="sha512-+4zCK9k+qNFUR5X+cKL9EIR+ZOhtIloNl9GIKS57V1MyNsYpYcUrUeQc9vNfzsWfV28IaLL3i96P9sdNyeRssA=="
        crossOrigin="anonymous"
      />
      <div className={metricsStyle}>
        <div className={metricsStyleColumn}>
          <div className={metricStyle}>
            <i className={`fas fa-layer-group ${orange}`}></i> WS {workspace}
          </div>
          <div className={metricStyle}>
            <i className={`far fa-clock ${green}`}></i> {time} {ampm}
          </div>
          <div className={`${metricStyle}`}>
            <i className={`far fa-calendar ${yellow}`}></i> {day}, {month} {dayNum} {year}
          </div>
        </div>
        <div className={css({ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px" })}>
          {runningApps.length > 0 ? runningApps.map((app, i) => (
            <div key={i} className={metricStyle}>
              <i className={`fas fa-window-maximize ${blue}`}></i> {app}
            </div>
          )) : <div className={metricStyle}><span>N/A</span></div>}
        </div>
        <div className={metricsStyleColumn}>
          <div className={metricStyle}>
            <i className={`fas fa-thermometer-half ${red}`}></i> {weather.temp}&deg;C
          </div>
          <div className={metricStyle}>
            <i className={`fa fa-cloud ${blue}`}></i> {weather.forecast}
          </div>
          <div className={metricStyle}>
            <i className={`fas fa-microchip ${blue}`}></i> CPU {cpuUsage}%
          </div>
          <div className={metricStyle}>
            <i className={`fas fa-memory ${green}`}></i> RAM {memoryUsage}%
          </div>
          <div className={metricStyle}>
            <i className="fas fa-hdd"></i> Disk {disk}%
          </div>
          <div className={metricStyle}>
            <i className="fas fa-wifi"></i>
            {wifi.ssid === "N/A" ? " N/A" : <> {wifi.ssid} ({wifi.speed} Mbps)</>}
          </div>
        </div>
      </div>
    </div>
  );
};
