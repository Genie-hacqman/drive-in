import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Loading from '../../components/common/Loading';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const completeOAuth = useAuthStore((state) => state.completeOAuth);
  const { addToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const error = params.get('error');
    const provider = params.get('provider') || 'OAuth';

    if (error || !code) {
      addToast(error || `${provider} sign-in could not be completed.`, 'error');
      navigate(params.get('returnTo') === '/admin/dashboard' ? '/admin/login' : '/login', { replace: true });
      return;
    }

    completeOAuth(code)
      .then((session) => {
        addToast(`Signed in with ${provider}`, 'success');
        navigate(session.redirectTo || (session.user.role === 'admin' ? '/admin/dashboard' : '/dashboard'), { replace: true });
      })
      .catch((sessionError) => {
        addToast(sessionError.message || `${provider} sign-in failed.`, 'error');
        navigate('/login', { replace: true });
      });
  }, [addToast, completeOAuth, location.search, navigate]);

  return (
    <>
      <Helmet><title>Signing In - Gene&apos;s InDrive</title></Helmet>
      <Loading />
    </>
  );
};

export default OAuthCallback;
