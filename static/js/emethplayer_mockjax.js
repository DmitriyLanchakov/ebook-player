$.mockjax({
    url:"ajax.php?act=login",
    responseTime:750,
    response:function(e){
        this.responseText= {
            status:"success",
            username:e.data.username,
            currently_playing:{
                id:1,
                file_loc:'http://www.christkirk.com/Sermons/mp3/1713.mp3',
                title:'Sermon Title Here',
                author:1,
                author_name:'Douglas Wilson',
                church:'Christ Church, Moscow Idaho',
                church_website:'http://www.christkirk.com/',
                description:'I am a sermon description',
                plays:1143,
                start_timestamp:11432434,
                current_playing_time:11,
                total_playing_time:432,
            }
        }
    }
});

