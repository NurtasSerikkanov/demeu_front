import React, { useState } from 'react';
import Input from '../../shared/ui/input/input';
import Button from '../../shared/ui/button/button';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/auth/authSlice';
import { RootState } from '../../app/store';
import styles from './loginForm.module.scss';
import { AppDispatch } from '../../app/store';
import { useTranslation } from 'react-i18next';

const LoginForm = () => {
    const { t} = useTranslation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(login(formData));
    };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          type="email"
          name="email"
          value={formData.email}
          placeholder={t('enter_email')}
          onChange={handleChange}
          iconName="emailIcon"
        />
        <Input
          type="password"
          name="password"
          value={formData.password}
          placeholder={t('enter_password')}
          onChange={handleChange}
          iconName="passwordIcon"
        />
        <div className={styles.submitTools}>
            <h3>{t('forgot_password')}</h3>
            <Button type="submit" disabled={loading}>
                {loading ? t('loading...') : t('login')}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
