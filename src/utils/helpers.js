import moment from 'moment';

export const filterDataHelper = (fileContent, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    const lines = fileContent.split('\n');
    const data = lines.map(line => line.split('\t')).filter(row => row.length > 1);

    const filteredData = data.filter(row => {
        const date = new Date(row[1]);
        return date >= start && date < end;
    });

    if (filteredData.length === 0) {
        return [];
    }

    const groupedData = {};
    filteredData.forEach(row => {
        const id = row[0];
        const [date, time] = row[1].split(' ');

        if (!groupedData[id]) {
            groupedData[id] = {};
        }

        if (!groupedData[id][date]) {
            groupedData[id][date] = { entrada: null, salida: null };
        }

        if (!groupedData[id][date].entrada) {
            groupedData[id][date].entrada = time;
        } else {
            groupedData[id][date].salida = time;
        }
    });

    return groupedData;
};

export const getDataForId = (fileContent, id, startDate, endDate) => {
    const lines = fileContent.split('\n');
    const data = lines.map(line => line.split('\t')).filter(row => row.length > 1);

    const filteredData = data.filter(row => {
        const date = new Date(row[1]);
        const formattedDate = date.toISOString().split('T')[0];
        return row[0].trim() === id && formattedDate >= startDate && formattedDate <= endDate;
    });

    if (filteredData.length === 0) {
        return null;
    }

    const groupedData = {};
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
        const formattedDate = currentDate.toISOString().split('T')[0];
        const dayOfWeek = getDayName(formattedDate);
        groupedData[formattedDate] = { dayOfWeek, entrada: "", salida: "" };
        currentDate.setDate(currentDate.getDate() + 1);
    }

    filteredData.forEach(row => {
        const id = row[0];
        const date = row[1].split(" ")[0]; // Obtiene la fecha sin la hora
        const time = row[1].split(" ")[1].split(":").slice(0, 2).join(":"); // Obtiene la hora sin los segundos
        const formattedDate = new Date(date).toISOString().split('T')[0];

        if (!groupedData[formattedDate]) {
            groupedData[formattedDate] = { dayOfWeek: moment(formattedDate).format('dddd'), entrada: null, salida: null };
        }

        if (!groupedData[formattedDate].entrada) {
            groupedData[formattedDate].entrada = time;
        } else {
            groupedData[formattedDate].salida = time;
        }
    });

    return groupedData;
};

export const calculateHoursWorked = (startTime, endTime) => {
    const start = moment(startTime, "HH:mm");
    const end = moment(endTime, "HH:mm");

    if (!start.isValid() || !end.isValid()) {
        return "Invalid";
    }

    const duration = moment.duration(end.diff(start));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

export const getDayName = (dateString) => {
    const date = new Date(dateString);
  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  return days[date.getDay()];
};
