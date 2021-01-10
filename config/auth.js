module.exports = {
    ensureAuthenticated : function(req,res,next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg' , 'Non sei autorizzato, accedi prima');
    res.redirect('/manager/login');
    },
}