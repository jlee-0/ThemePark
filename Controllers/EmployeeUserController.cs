using AutoMapper;
using Microsoft.AspNetCore.Authorization; // used for authorization
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net;
using System.Net.Http;
using System.Web;
using System.IdentityModel.Tokens.Jwt; // used to generate token
using System.Security.Claims;
using System.Text;
using ThemePark.Entities;
using ThemePark.Helpers;

namespace ThemePark.Controllers
{
	[Route("api/[controller]")]
    public class EmployeeUserController : Controller
    {

        private readonly DataContext _context;
        private readonly ILogger _logger;
        private readonly AppSettings _appSettings;
        private readonly IUserAuthService _userAuthService;
        private readonly IMapper _mapper;

        public EmployeeUserController(
        	DataContext context, 
        	ILogger<SampleDataController> logger,
        	IOptions<AppSettings> appSettings,
        	IUserAuthService userAuthService,
        	IMapper mapper)
        {
            _context = context;
            _logger = logger;
            _appSettings = appSettings.Value;
            _userAuthService = userAuthService;
            _mapper = mapper;
        }

        [HttpPost("[action]")]
        public IActionResult Authenticate([FromBody] EmployeeUserDataModel userModel)
        {
        	// returns a EmployeeUser
        	var user = _userAuthService.AuthenticateEmployeeUser(
        		userModel.EmployeeUserName, userModel.EmployeePassword);

        	if (user == null)
        		return Unauthorized();
			
			// generate a tokenString that is should be stored client side
			var tokenHandler = new JwtSecurityTokenHandler();
			var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
			var tokenDescriptor = new SecurityTokenDescriptor
			{
				Subject = new ClaimsIdentity(new Claim[]
				{
					new Claim(ClaimTypes.Name, user.EmployeeId.ToString())
				}),
				Expires = DateTime.UtcNow.AddDays(3), // token expires in 3 days
				SigningCredentials = new SigningCredentials(
					new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
			};
			var token = tokenHandler.CreateToken(tokenDescriptor);
			var tokenString = tokenHandler.WriteToken(token);

			return Ok(new {
				EmployeeId = user.EmployeeId,
				EmployeeUserName = user.EmployeeUserName,
				// DO NOT RETURN A PASSWORD HERE
				Token = tokenString
			});
        }

        [HttpPost("[action]")]
        public IActionResult Register([FromBody]EmployeeUserDataModel userModel)
        {
        	// map employeeuserdatamodel to employeeuser entity
            var user = _mapper.Map<EmployeeLogin>(userModel);

            try 
            {
            	// save
            	_userAuthService.CreateEmployeeUser(user, userModel.EmployeePassword);
            	return Ok();
            }
            catch (AppException ex)
            {
            	// return error message
            	return BadRequest(ex.Message);
            }
        }
    }
}