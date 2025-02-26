using AutoMapper;
using EP.Service.SocialMediaAPI.model.Domain;
using EP.Service.SocialMediaAPI.model.Dto;

namespace EP.Service.SocialMediaAPI.Mappings
{
    public class AutoMappingProfile : Profile
    {
        public AutoMappingProfile()
        {
            CreateMap<SocialMedia, SocialMediaDto>().ReverseMap();
            CreateMap<User, UserDto>().ReverseMap();
            CreateMap<Like, LikeDto>().ReverseMap();
            //CreateMap<Comment, CommentDto>().ReverseMap();
        }
    }
}
