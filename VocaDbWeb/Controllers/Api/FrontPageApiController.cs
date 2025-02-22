using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VocaDb.Model.DataContracts.UseCases;
using VocaDb.Model.Service;
using VocaDb.Web.Code.Security;
using ApiController = Microsoft.AspNetCore.Mvc.ControllerBase;

namespace VocaDb.Web.Controllers.Api
{
	[EnableCors(AuthenticationConstants.WebApiCorsPolicy)]
	[Route("api/frontpage")]
	[ApiController]
	public class FrontPageApiController : ApiController
	{
		private readonly OtherService _otherService;

		public FrontPageApiController(OtherService otherService)
		{
			_otherService = otherService;
		}

		[HttpGet("")]
		[ApiExplorerSettings(IgnoreApi = true)]
		public Task<FrontPageForApiContract> GetFrontPageContent() => _otherService.GetFrontPageForApiContent();
	}
}
