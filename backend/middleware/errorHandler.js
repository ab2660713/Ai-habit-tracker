export const notFound=(req,res,next)=>{
    res.status(404).json({message:`Route not found: ${req.orginalUrl}`})
};
const errorHandler = (err, req, res, next) => {
    console.log(err)
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
  
    res.status(statusCode).json({
      message:err.message||"Server error"
    });
  };
  
  export default errorHandler;