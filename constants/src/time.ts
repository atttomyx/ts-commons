export const time = {
    millisecondsInSecond: 1000,
    secondsInMinute: 60,
    minutesInHour: 60,
    hoursInDay: 24,
    daysInWeek: 7,
    daysInMonth: 30,
    daysInYear: 365,
};

export const times = {
    minute: time.secondsInMinute * time.millisecondsInSecond,
    hour: time.minutesInHour * time.secondsInMinute * time.millisecondsInSecond,
    day: time.hoursInDay * time.minutesInHour * time.secondsInMinute * time.millisecondsInSecond,
    week: time.daysInWeek * time.hoursInDay * time.minutesInHour * time.secondsInMinute * time.millisecondsInSecond,
    month: time.daysInMonth * time.hoursInDay * time.minutesInHour * time.secondsInMinute * time.millisecondsInSecond,
    year: time.daysInYear * time.hoursInDay * time.minutesInHour * time.secondsInMinute * time.millisecondsInSecond,
};
