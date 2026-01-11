const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Déterminer le statut et le message
    let status = err.status || 500;
    let message = err.message || 'Erreur serveur interne';

    // Erreurs PostgreSQL spécifiques
    if (err.code === '23505') {
        status = 400;
        message = 'Cette ressource existe déjà (violation de contrainte unique)';
    } else if (err.code === '23503') {
        status = 400;
        message = 'Référence invalide (la ressource liée n\'existe pas)';
    } else if (err.code === '22P02') {
        status = 400;
        message = 'Format de données invalide';
    }

    const response = {
        message,
        ...(process.env.NODE_ENV === 'development' && {
            error: err.message,
            code: err.code,
            stack: err.stack
        })
    };

    res.status(status).json(response);
};

module.exports = errorHandler;