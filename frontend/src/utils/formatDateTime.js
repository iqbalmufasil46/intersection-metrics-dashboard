import dayjs from 'dayjs';

const formatDateTime = (dateTime) => {
  return dayjs(dateTime).format('DD-MM-YYYY h:mm A');
};

export default formatDateTime;
