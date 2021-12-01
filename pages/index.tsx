import { ToastContainer } from 'react-toastify';

import AlbumForm from '../client/components/AlbumForm';

import 'react-toastify/dist/ReactToastify.css';
import styles from './index.module.css';

const Index = function Index(): JSX.Element {
  return (
    <div className={styles.root}>
      <header className={styles.header}>Correct albums</header>
      <AlbumForm />
      <ToastContainer />
    </div>
  );
};

export default Index;
