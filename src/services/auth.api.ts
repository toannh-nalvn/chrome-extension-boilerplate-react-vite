import { useMutation, useQuery } from 'react-query';

import { useAxios, useDispatch } from '@src/hooks';
import { removeAuth, setAuth } from '@src/store/slices/auth.slice';
import { UserInfo } from '@src/types';

const useLogin = async (tabId: number) => {
  const dispatch = useDispatch();
  const fromPageLocalStore = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      return JSON.stringify(localStorage);
    },
  });

  dispatch(setAuth(JSON.parse(fromPageLocalStore[0].result)));
};

const useGetUserInfo = () => {
  const axios = useAxios();

  return useQuery<UserInfo, Error>(
    ['user'],
    async () => {
      const { data } = await axios.get(`/user/info`);

      return data;
    },
    {
      staleTime: 60 * 1000,
    },
  );
};

const useRefreshToken = () => {
  const axios = useAxios();
  const dispatch = useDispatch();

  return useMutation(({ data }: { data: { refreshToken: string } }) => axios.post(`/refresh-token`, { data }), {
    onSuccess: data => {
      dispatch(setAuth(data.data.data));
    },
  });
};

const useLogout = () => {
  const axios = useAxios();
  const dispatch = useDispatch();

  return useMutation(() => axios.post(`/logout`), {
    onSuccess: () => {
      dispatch(removeAuth());

      window.localStorage.setItem('logout', Date.now().toString());
    },
  });
};

export { useGetUserInfo, useLogin, useLogout, useRefreshToken };
