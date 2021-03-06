import React, { useMemo } from 'react';
import { useFirestore, useFirestoreCollection } from 'reactfire';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/core';

import { Container, MainLayout } from '../../components';
import { useAlertNotification, useErrorNotifier } from '../../hooks';
import DataTable from './DataTable';

const Dashboard = () => {
  const errorNotifier = useErrorNotifier({
    severity: 'error',
    component: 'dashboard',
  });
  const firestore = useFirestore();
  const { docs } = useFirestoreCollection(
    firestore
      .collection('material-requests')
      .orderBy('createdAt', 'desc')
      .limit(100),
  );
  const materialRequests = useMemo(
    () =>
      docs.map((item) => ({
        id: item.id,
        ...item.data(),
        update: item.update,
      })),
    [docs],
  );
  const notify = useAlertNotification({
    title: 'Ha habido un problema al actualizar el estado.',
  });
  const createStatusUpdateFn = (id) => async (newStatus) => {
    const ref = firestore.collection('material-requests').doc(id);
    try {
      await ref.update({
        status: newStatus,
      });
    } catch (e) {
      notify({
        description: e.message,
      });
      errorNotifier(e);
    }
  };
  return (
    <MainLayout>
      <Container>
        <Tabs variant="soft-rounded" variantColor="teal">
          <TabList mb={4}>
            <Tab>Activos</Tab>
            <Tab>Inactivos</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <DataTable
                materialRequests={materialRequests}
                createStatusUpdateFn={createStatusUpdateFn}
              />
            </TabPanel>
            <TabPanel>
              <DataTable
                materialRequests={materialRequests}
                createStatusUpdateFn={createStatusUpdateFn}
                showInactive
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </MainLayout>
  );
};

export default Dashboard;
