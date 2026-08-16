// const asyncHandlers = (requestHandler) => {
//   (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//   };
// };

//  const asyncHandler = ()=>{}
//  const asyncHandler = (fun)=>()=>{}
//  const asyncHandler = (fun)=>async(req,res,next)=>{}

const asyncHandler = (fun) => async (req, res, next) => {
  try {
    await fun(req, res, next);
  } catch (err) {
    res.status(err.code || 400).json({
      success: false,
      message: err.message,
    });
  }
};

export { asyncHandler };
