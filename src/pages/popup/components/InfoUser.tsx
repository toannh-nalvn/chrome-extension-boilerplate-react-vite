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

const APPROVAL_STATUS = {
  CANCELED: 'CANCELED',
};

const date = new Date();

const InfoUser = () => {
  const currentMonth = date.getMonth() + 1;
  const [month, setMonth] = useState(currentMonth.toString());
  const firstDay = new Date(date.getFullYear(), parseInt(month) - 1, 1).toLocaleDateString('fr-CA');
  const lastDay = new Date(date.getFullYear(), parseInt(month), 0).toLocaleDateString('fr-CA');
  const checkInCheckOutDays = useGetCheckInCheckOutPages(firstDay, lastDay);
  const workTimeRegisterDays = useGetWorkTimeRegistersPages(firstDay, lastDay);
  const userQuery = useGetUserInfo();
  const [days, setDays] = useState([]);
  const daysOfWeek = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const formatDate = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const onMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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

      if (result) {
        return result?.checkIn;
      } else {
        return '---';
      }
    }
  };

  const getCheckOutDateTime = rowDay => {
    const formattedDay = rowDay.toLocaleDateString('fr-CA');
    const checkInCheckOutDayResults = checkInCheckOutDays.data?.data?.results;

    if (checkInCheckOutDayResults?.length > 0) {
      const result = checkInCheckOutDayResults.find(result => result.day === formattedDay);

      if (result) {
        return result?.checkOut;
      } else {
        return '---';
      }
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
            const result =
              workTimeRegisterDay?.approvalStatus === APPROVAL_STATUS.CANCELED ? (
                <s>{`${timeInterval?.from} - ${timeInterval?.to}`}</s>
              ) : (
                `${timeInterval?.from} - ${timeInterval?.to}`
              );

            return result;
          }
        }
      }
    }

    return '---';
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

  const debugFunc = (rowDay: Date, testDay: string, ...theArgs) => {
    const formattedDay = rowDay.toLocaleDateString('fr-CA');
    if (formattedDay === testDay) {
      console.log(formattedDay);
      console.log(theArgs);
    }
  };

  const countCheckInCheckOutTime = (rowDay: Date) => {
    const checkInTime = getCheckInDateTime(rowDay);
    const checkOutTime = getCheckOutDateTime(rowDay);
    let totalDayOffTime = 0;
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
        let minutes = 0;
        if (
          checkInDateTime < new Date(rowDay.getFullYear(), rowDay.getMonth(), rowDay.getDate(), 13, 0, 0) &&
          checkOutDateTime > new Date(rowDay.getFullYear(), rowDay.getMonth(), rowDay.getDate(), 13, 0, 0)
        ) {
          minutes = Math.floor(diff / 1000 / 60) - 90;
        } else {
          minutes = Math.floor(diff / 1000 / 60);
        }
        const hours = minutes / 60;

        totalDayOffTime += hours || 0;

        return totalDayOffTime;
      }
    }
  };

  const countRemoteTime = (rowDay: Date) => {
    const formattedDay = rowDay.toLocaleDateString('fr-CA');
    const workTimeRegisterDayResults = workTimeRegisterDays.data?.data?.results;
    const remoteDayList = workTimeRegisterDayResults?.filter(
      workTimeRegisterDayResult => workTimeRegisterDayResult.type === MODE.REMOTE,
    );

    if (remoteDayList?.length > 0) {
      let totalRemoteTime = 0;
      for (const workTimeRegisterDay of remoteDayList) {
        for (const timeInterval of workTimeRegisterDay.timeIntervals) {
          if (timeInterval.day === formattedDay && workTimeRegisterDay.approvalStatus !== APPROVAL_STATUS.CANCELED) {
            const checkInTime = timeInterval.from;
            const checkOutTime = timeInterval.to;
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
                let minutes = 0;
                if (
                  checkInDateTime < new Date(rowDay.getFullYear(), rowDay.getMonth(), rowDay.getDate(), 13, 0, 0) &&
                  checkOutDateTime > new Date(rowDay.getFullYear(), rowDay.getMonth(), rowDay.getDate(), 13, 0, 0)
                ) {
                  minutes = Math.floor(diff / 1000 / 60) - 90;
                } else {
                  minutes = Math.floor(diff / 1000 / 60);
                }

                const hours = minutes / 60;

                totalRemoteTime += hours || 0;
              }
            }
          }
        }
      }

      return totalRemoteTime;
    }
  };

  const countDayOffTime = (rowDay: Date) => {
    const formattedDay = rowDay.toLocaleDateString('fr-CA');
    const workTimeRegisterDayResults = workTimeRegisterDays.data?.data?.results;
    const dayOffList = workTimeRegisterDayResults?.filter(
      workTimeRegisterDayResult => workTimeRegisterDayResult.type === MODE.DAY_OFF,
    );

    if (dayOffList?.length > 0) {
      let totalDayOffTime = 0;
      for (const workTimeRegisterDay of dayOffList) {
        for (const timeInterval of workTimeRegisterDay.timeIntervals) {
          if (timeInterval.day === formattedDay && workTimeRegisterDay.approvalStatus !== APPROVAL_STATUS.CANCELED) {
            const checkInTime = timeInterval.from;
            const checkOutTime = timeInterval.to;
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
                let minutes = 0;
                if (
                  checkInDateTime < new Date(rowDay.getFullYear(), rowDay.getMonth(), rowDay.getDate(), 13, 0, 0) &&
                  checkOutDateTime > new Date(rowDay.getFullYear(), rowDay.getMonth(), rowDay.getDate(), 13, 0, 0)
                ) {
                  minutes = Math.floor(diff / 1000 / 60) - 90;
                } else {
                  minutes = Math.floor(diff / 1000 / 60);
                }

                const hours = minutes / 60;
                totalDayOffTime += hours || 0;
              }
            }
          }
        }
      }

      return totalDayOffTime;
    }
  };

  const totalWorkingTime = (dayOffTime: number, remoteTime: number, checkInCheckOutTime: number) => {
    const totalTimeWorking = dayOffTime + remoteTime + checkInCheckOutTime;
    return totalTimeWorking;
  };

  const calculatorSumTimeWorking = (rowDay: Date) => {
    const totalTimeDayOff = countDayOffTime(rowDay);
    const totalTimeRemote = countRemoteTime(rowDay);
    const totalTimeCheckInCheckOut = countCheckInCheckOutTime(rowDay);
    const totalTimeWorking = totalWorkingTime(totalTimeDayOff, totalTimeRemote, totalTimeCheckInCheckOut);

    debugFunc(rowDay, '2024-01-12', totalTimeDayOff, totalTimeRemote, totalTimeCheckInCheckOut);

    return <p>{totalTimeWorking} (giờ)</p>;
  };

  const isWeekends = (rowDay: Date) => {
    const dayOfWeek = rowDay.getDay();
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;

    return isWeekend;
  };

  const renderResultCols = (rowDay: Date) => {
    if (isWeekends(rowDay)) {
      return <p style={{ color: 'green' }}>Cuối tuần</p>;
    } else {
      return calculatorSumTimeWorking(rowDay);
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
        <Select placeholder="Chọn tháng" onChange={onMonthChange} defaultValue={month} style={{ width: 200 }}>
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
                  <Td>{renderResultCols(day)}</Td>
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
