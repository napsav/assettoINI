
module.exports = {
isAdmin : function(req,res,next) {
    if(!req.user.admin) {
        req.flash('error_msg' , 'L\'utente non è un\'amministratore');
        res.redirect('/manager/errore');
    } else {
        return next();
    }
}
}