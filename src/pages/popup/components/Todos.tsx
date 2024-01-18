'use client';

import { Button } from '@chakra-ui/react';

import { useDispatch, useSelector } from '@root/src/hooks';
import { setAuth } from '@src/store/slices/auth.slice';

import styles from '@pages/popup/Popup.module.scss';
import InfoUser from './InfoUser';

const Todos = () => {
  const { isAuthorized } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const getLoginData = async () => {
    const queryOptions = { active: true };
    const [tab] = await chrome.tabs.query(queryOptions);

    const fromPageLocalStore = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return JSON.stringify(localStorage);
      },
    });

    const localStorageItems = JSON.parse(fromPageLocalStore[0].result);
    dispatch(setAuth(localStorageItems));
  };

  return (
    <div className={styles.container}>
      {isAuthorized ? (
        <InfoUser />
      ) : (
        <Button colorScheme="blue" onClick={getLoginData}>
          Lấy thông tin đăng nhập
        </Button>
      )}
    </div>
  );
};

export default Todos;
