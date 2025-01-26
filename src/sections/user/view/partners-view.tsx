import type { User } from 'src/services/user/user.dto';

import { useState, useEffect } from 'react';

import UserService from 'src/services/user';

import { UserView } from './user-view';

const PartnersView = () => {
  const [data, setData] = useState<User[]>();
  const [loading, setLoading] = useState(true);

  const init = async () => {
    const list = await UserService.list();
    setData(list);
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  return <UserView loading={loading} data={data} />;
};

export default PartnersView;
