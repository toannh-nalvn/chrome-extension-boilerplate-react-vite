'use client';

import {
  Divider,
  Heading,
  Select,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { useGetUserInfo } from '@root/src/services/auth.api';
import { useGetCheckInCheckOutPages, useGetWorkTimeRegistersPages } from '@root/src/services/fetchPosts';

const MODE = {
  REMOTE: 'REMOTE',
  DAY_OFF: 'DAYOFF',
};
const date = new Date();

const InfoUser = () => {
  const currentMonth = date.getMonth() + 1;
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('fr-CA');
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleDateString('fr-CA');

  const checkInCheckOutDays = useGetCheckInCheckOutPages(firstDay, lastDay);
  const workTimeRegisterDays = useGetWorkTimeRegistersPages(firstDay, lastDay);
  const userQuery = useGetUserInfo();
  const [month, setMonth] = useState(currentMonth.toString());
  const [days, setDays] = useState([]);
  const daysOfWeek = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const formatDate = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(event.target.value);
  };

  const getDaysInMonth = (month, year) =>
    new Array(31)
      .fill('')
      .map((v, i) => new Date(year, month - 1, i + 1))
      .filter(v => v.getMonth() === month - 1);

  const getCheckInDateTime = rowDay => {
    const formattedDay = rowDay.toLocaleDateString('fr-CA');
    const checkInCheckOutDayResults = checkInCheckOutDays.data?.data?.results;

    if (checkInCheckOutDayResults?.length > 0) {
      const result = checkInCheckOutDayResults.find(result => result.day === formattedDay);
      return result?.checkIn;
    }
  };

  const getCheckOutDateTime = rowDay => {
    const formattedDay = rowDay.toLocaleDateString('fr-CA');
    const checkInCheckOutDayResults = checkInCheckOutDays.data?.data?.results;

    if (checkInCheckOutDayResults?.length > 0) {
      const result = checkInCheckOutDayResults.find(result => result.day === formattedDay);
      return result?.checkOut;
    }
  };

  const getWorkTimeRegisterDateTime = (rowDay, mode) => {
    const formattedDay = rowDay.toLocaleDateString('fr-CA');
    const workTimeRegisterDayResults = workTimeRegisterDays.data?.data?.results;
    const dayOffList = workTimeRegisterDayResults?.filter(
      workTimeRegisterDayResult => workTimeRegisterDayResult.type === mode,
    );

    if (dayOffList?.length > 0) {
      for (const workTimeRegisterDay of dayOffList) {
        for (const timeInterval of workTimeRegisterDay.timeIntervals) {
          if (timeInterval.day === formattedDay) {
            return `${timeInterval?.from} - ${timeInterval?.to}`;
          }
        }
      }
    }
  };

  const getHourFromString = (s: string) => {
    const splitRowObject = s.split(':');
    return parseInt(splitRowObject[0]);
  };

  const getMinuteFromString = (s: string) => {
    const splitRowObject = s.split(':');
    return parseInt(splitRowObject[1]);
  };

  const getSecondFromString = (s: string) => {
    const splitRowObject = s.split(':');
    return parseInt(splitRowObject[2]);
  };

  const isRemoteTime = (rowDay, mode) => {
    const formattedDay = rowDay.toLocaleDateString('fr-CA');
    const workTimeRegisterDayResults = workTimeRegisterDays.data?.data?.results;
    const remoteDayList = workTimeRegisterDayResults?.filter(
      workTimeRegisterDayResult => workTimeRegisterDayResult.type === mode,
    );

    if (remoteDayList?.length > 0) {
      for (const workTimeRegisterDay of remoteDayList) {
        for (const timeInterval of workTimeRegisterDay.timeIntervals) {
          if (timeInterval.day === formattedDay) {
            return true;
          }
        }
      }
    }

    return false;
  };

  const isDayOffTime = (rowDay, mode) => {
    const formattedDay = rowDay.toLocaleDateString('fr-CA');
    const workTimeRegisterDayResults = workTimeRegisterDays.data?.data?.results;
    const dayOffList = workTimeRegisterDayResults?.filter(
      workTimeRegisterDayResult => workTimeRegisterDayResult.type === mode,
    );

    if (dayOffList?.length > 0) {
      for (const workTimeRegisterDay of dayOffList) {
        for (const timeInterval of workTimeRegisterDay.timeIntervals) {
          if (timeInterval.day === formattedDay) {
            return true;
          }
        }
      }
    }

    return false;
  };

  const countRemoteTime = (rowDay, mode) => {
    const formattedDay = rowDay.toLocaleDateString('fr-CA');
    const workTimeRegisterDayResults = workTimeRegisterDays.data?.data?.results;
    const dayList = workTimeRegisterDayResults?.filter(
      workTimeRegisterDayResult => workTimeRegisterDayResult.type === mode,
    );

    if (dayList?.length > 0) {
      for (const workTimeRegisterDay of dayList) {
        for (const timeInterval of workTimeRegisterDay.timeIntervals) {
          if (timeInterval.day === formattedDay) {
            const checkOutDateTime = new Date(`${timeInterval.day} ${timeInterval.to}`);
            const checkInDateTime = new Date(`${timeInterval.day} ${timeInterval.from}`);

            const diff = Math.abs(checkOutDateTime.getTime() - checkInDateTime.getTime());
            const minutes = Math.floor(diff / 1000 / 60) - 90;
            const hours = Math.floor(minutes / 60);

            if (hours && hours > 0) {
              return `Chúc mừng bạn đi làm đủ công với thời gian ${hours} giờ (chính xách là ${minutes} phút)`;
            } else {
              return `Không đủ công`;
            }
          }
        }
      }
    }

    return 0;
  };

  const calculatorSumTimeWorking = (rowDay: Date) => {
    if (isRemoteTime(rowDay, MODE.REMOTE)) {
      return countRemoteTime(rowDay, MODE.REMOTE);
    } else if (isDayOffTime(rowDay, MODE.DAY_OFF)) {
      return countRemoteTime(rowDay, MODE.DAY_OFF);
    } else {
      const checkInTime = getCheckInDateTime(rowDay);
      const checkOutTime = getCheckOutDateTime(rowDay);
      if (checkInTime) {
        const checkInDateTime = new Date(
          rowDay.getFullYear(),
          rowDay.getMonth(),
          rowDay.getDate(),
          getHourFromString(checkInTime),
          getMinuteFromString(checkInTime),
          getSecondFromString(checkInTime),
        );

        if (checkOutTime) {
          const checkOutDateTime = new Date(
            rowDay.getFullYear(),
            rowDay.getMonth(),
            rowDay.getDate(),
            getHourFromString(checkOutTime),
            getMinuteFromString(checkOutTime),
            getSecondFromString(checkOutTime),
          );

          const diff = Math.abs(checkOutDateTime.getTime() - checkInDateTime.getTime());
          const minutes = Math.floor(diff / 1000 / 60) - 90;
          const hours = Math.floor(minutes / 60);

          if (hours && hours > 0) {
            return `Chúc mừng bạn đi làm đủ công với thời gian ${hours} giờ (chính xác là ${minutes} phút)`;
          } else {
            return `Không đủ công`;
          }
        }
      }

      return 'Có lỗi xảy ra';
    }
  };

  useEffect(() => {
    if (month !== '') {
      const renderDays = getDaysInMonth(month, date.getFullYear()).reverse();
      setDays(renderDays);
    }
  }, [month]);

  return (
    <div>
      <Stack spacing={6}>
        <Heading as="h1" size="4xl" noOfLines={1}>
          Chào, {userQuery.data?.data?.username}
        </Heading>
        <Divider />
        <Select placeholder="Chọn tháng" onChange={handleChange} defaultValue={month} disabled>
          {[...Array(12).keys()].map(v => (
            <option key={`${v + 1}`} value={`${v + 1}`}>{`Tháng ${v + 1}`}</option>
          ))}
        </Select>
        <Divider />
        <TableContainer>
          <Table variant="simple">
            <TableCaption>Thống kê thông tin chấm công</TableCaption>
            <Thead>
              <Tr>
                <Th>Ngày</Th>
                <Th>CheckIn</Th>
                <Th>CheckOut</Th>
                <Th>Nghỉ phép</Th>
                <Th>Remote</Th>
                <Th>Tổng</Th>
              </Tr>
            </Thead>
            <Tbody>
              {days.map(day => (
                <Tr key={day}>
                  <Td>{`${daysOfWeek[day.getDay()]}, ${formatDate.format(day)}`}</Td>
                  <Td>{getCheckInDateTime(day)}</Td>
                  <Td>{getCheckOutDateTime(day)}</Td>
                  <Td>{getWorkTimeRegisterDateTime(day, MODE.DAY_OFF)}</Td>
                  <Td>{getWorkTimeRegisterDateTime(day, MODE.REMOTE)}</Td>
                  <Td>{calculatorSumTimeWorking(day)}</Td>
                </Tr>
              ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>Ngày</Th>
                <Th>CheckIn</Th>
                <Th>CheckOut</Th>
                <Th>Nghỉ phép</Th>
                <Th>Remote</Th>
                <Th>Tổng</Th>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
      </Stack>
    </div>
  );
};

export default InfoUser;
