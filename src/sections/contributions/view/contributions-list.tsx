import type { Contribution} from 'src/services/cont/contribute.dto';

import { useState, useEffect, useCallback } from 'react';

import useUser from 'src/hooks/useUser';
import useAdmin from 'src/hooks/useAdmin';

import ContributionService from 'src/services/cont';
import { ContributionStatus } from 'src/services/cont/contribute.dto';

import { ContributionsView } from './contributions-view';

import type { ContributionProps } from '../contributions-table-row';

const ContributionsList = () => {
  const [data, setData] = useState<ContributionProps[]>();
  const [loading, setLoading] = useState(true);
  const { isAdminMode } = useAdmin();
  const { user } = useUser();

  const getStatus = (status: ContributionStatus): ContributionProps['status'] => {
    if (status === ContributionStatus.Failed) return 'failed';
    if (status === ContributionStatus.Pending) return 'pending';
    return 'success';
  };

  const getContributions = useCallback(
    (result: Contribution[]): ContributionProps[] =>
      result.map((item) => ({
        amount: item.amount,
        id: item.id,
        months: item.months,
        sender: item.donor,
        status: getStatus(item.status),
        timestamp: (item.completedAt || item.createdAt).toDate(),
        code: item?.trxCode,
      })),
    []
  );

  const init = useCallback(async () => {
    const promise = isAdminMode
      ? ContributionService.getList({ count: 20, page: 1 })
      : ContributionService.getByUserId(user?.id!, 20);
    const res = await promise;

    // TODO: Implement pagination
    // pageRef.current.set(res.metadata.page, res.data[res.data.length - 1].id);

    const result = 'metadata' in res ? res.data : res;
    const contributions = getContributions(result);
    setData(contributions);
    setLoading(false);
  }, [getContributions, isAdminMode, user?.id]);

  useEffect(() => {
    init();
  }, [init]);

  return <ContributionsView noToolbar loading={loading} data={data} noMultiSelect noPagination />;
};

export default ContributionsList;
