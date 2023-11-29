import { useQuery } from 'react-query';
import { useAxios } from '../hooks';
import { CheckInCheckOutPages, WorkTimeRegistersPages } from '../types';

const useGetCheckInCheckOutPages = (from: string, to: string) => {
  const axios = useAxios();

  return useQuery<CheckInCheckOutPages, Error>(
    [{ from, to }, 'checkInCheckOutDays'],
    async () => {
      const { data } = await axios.get(`/workTime/checkIn?page=1&size=31&from=${from}&to=${to}`);

      return data;
    },
    {
      staleTime: 60 * 1000,
      enabled: !!(from && to),
    },
  );
};

const useGetWorkTimeRegistersPages = (from: string, to: string) => {
  const axios = useAxios();

  return useQuery<WorkTimeRegistersPages, Error>(
    [{ from, to }, 'workTimeRegisters'],
    async () => {
      const { data } = await axios.get(`/workTimeRegisters?page=1&size=31&from=${from}&to=${to}`);

      return data;
    },
    {
      staleTime: 60 * 1000,
      enabled: !!(from && to),
    },
  );
};

export { useGetCheckInCheckOutPages, useGetWorkTimeRegistersPages };
