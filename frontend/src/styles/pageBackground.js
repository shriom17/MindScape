export const pageBgStyles = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    padding: '2rem 1rem 3rem',
    background:
      'radial-gradient(circle at 18% 22%, rgba(245, 158, 11, 0.18), transparent 36%), radial-gradient(circle at 82% 12%, rgba(34, 211, 238, 0.2), transparent 34%), linear-gradient(145deg, #081421 0%, #102334 52%, #152b36 100%)',
    overflow: 'hidden',
  },
  orbBase: {
    position: 'absolute',
    borderRadius: 999,
    filter: 'blur(2px)',
    pointerEvents: 'none',
  },
  orbLeft: {
    width: 260,
    height: 260,
    left: -60,
    top: '30%',
    background: 'rgba(250, 204, 21, 0.18)',
  },
  orbRight: {
    width: 320,
    height: 320,
    right: -100,
    top: '8%',
    background: 'rgba(56, 189, 248, 0.2)',
  },
  shell: {
    position: 'relative',
    zIndex: 1,
    width: 'min(1000px, 100%)',
    margin: '0 auto',
    padding: '1.6rem',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius: 24,
    background: 'rgba(7, 18, 26, 0.64)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 16px 40px rgba(5, 10, 20, 0.35)',
    color: '#f8fbff',
  },
};
