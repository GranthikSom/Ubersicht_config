export const command = "date +'%A\n%d %B, %Y\n%l:%M %p'";

export const refreshFrequency = 60000;

export const className =`
  @font-face {
    font-family: 'Anurati'; 
    src: url('Anurati.otf') format('opentype'); 
    font-weight: normal;
    font-style: normal;
  }
  
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  
  color:rgba(141, 31, 151, 0.77);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  
  .day {
    font-family: 'Anurati', sans-serif;
    font-size: 5vw; 
    letter-spacing: 0.1em;
    margin-bottom: 20px;
    font-weight: normal;
    line-height: 1;
    white-space: nowrap;
  }
  
  .date {
    font-size: 1.5vw;
    font-weight: bold;
    letter-spacing: 0.2em;
    margin-bottom: 10px;
    opacity: 1.0;
    white-space: nowrap;
  }
  
  .time {
    font-size: 1.2vw;
    font-weight: bold;
    letter-spacing: 0.1em;
    opacity: 1.0;
    white-space: nowrap;
  }
`;

export const render = ({output}) => {
  const [day, dateString, time] = output.split('\n');

  const displayDay = day ? day.toUpperCase() : 'LOADING';
  const displayDate = dateString ? dateString.toUpperCase() : '';
  
  const displayTime = time ? `- ${time.trim()} -` : '';

  return (
    <div>
      <div className="day">{displayDay}</div>
      <div className="date">{displayDate}</div>
      <div className="time">{displayTime}</div>
    </div>
  );
}


