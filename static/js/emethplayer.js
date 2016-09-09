
var get_current_info_timeout;
var curr_playing = {};
var update_current_lock = 0;
var last_update_time = -10;
var jplist;
var available_tracks = {};


function get_logged_in_user()
{
    jQuery.ajax({
        type: "POST",
        url: "ajax.php?act=get_logged_in_user",
        dataType:'json',
        data: { },
        success: function(data) {
            if (data.status == "success")
            {
                jQuery('.username_display').html(data.email);
                jQuery('.logged_in').css('display', 'block');
                jQuery('.logged_out').css('display', 'none');
                if (data.curr_playing != -1)
                    resume_track(data.curr_playing.audio_data, data.curr_playing.audio_time);
            }
            else
            {
                //not logged in
                //alert("Error: "+data.error);
            }
        },
        error: function (e) {
            console.log("error", e);
        }
    });
    load_playlist();
}

function load_playlist()
{
    jQuery.ajax({
        type: "POST",
        url: "ajax.php?act=get_playlist",
        dataType:'json',
        data: { },
        success: function(data) {
            if (data.status == "success")
            {
                jQuery.each(data.playlist, function(k,v){
                    add_to_playlist(data.playlist_data[v].title, data.playlist_data[v].file_loc, v, data.playlist_data[v].author_name, data.playlist_data[v].track_timestamp);
                });

            }
            else
            {
                //No playlist found.
                //alert("Error: "+data.error);
            }
        },
        error: function (e) {
            console.log("error", e);
        }
    });
}

function logout()
{
    jQuery.ajax({
        type: "POST",
        url: "ajax.php?act=logout",
        dataType:'json',
        data: {},
        success: function(data) {
            jQuery('.logged_in').css('display', 'none');
            jQuery('.logged_out').css('display', 'block');
        },
        error: function (e) {
            console.log("error", e);
        }
    });
}

function login()
{
    var dataz = {
        'login_email': jQuery('#login_email:visible').val(), 
        'login_pass': jQuery('#login_pass:visible').val(), 
    };
    jQuery.ajax({
        type: "POST",
        url: "ajax.php?act=login",
        dataType:'json',
        data: dataz,
        success: function(data) {
            if (data.status == "success")
            {
                jQuery('.username_display').html(data.email);
                jQuery('.logged_in').css('display', 'block');
                jQuery('.logged_out').css('display', 'none');
                jQuery('.username_display').html(data.email);
                if (data.curr_playing != -1)
                    resume_track(data.curr_playing.audio_data, data.curr_playing.audio_time);
                load_playlist();
            }
            else
            {
                alert("Error: "+data.error);
            }
        },
        error: function (e) {
            console.log("error", e);
        }
    });
}

function register()
{
    var dataz = {
        'register_email': jQuery('#register_email:visible').val(), 
        'register_pass1': jQuery('#register_pass1:visible').val(), 
        'register_pass2': jQuery('#register_pass2:visible').val(), 
    };
    if (dataz['register_pass1'] != dataz['register_pass2'])
    {
        alert("Error: Your passwords did not match.");
    }
    else
    {
        jQuery.ajax({
            type: "POST",
            url: "ajax.php?act=register",
            dataType:'json',
            data: dataz,
            success: function(data) {
                if (data.status == "success")
                {
                    jQuery('.username_display').html(data.email);
                    jQuery('.logged_in').css('display', 'block');
                    jQuery('.logged_out').css('display', 'none');
                    alert("Thanks for registering, "+data.email+"!");
                    if (data.curr_playing != -1)
                        resume_track(data.curr_playing.audio_data, data.curr_playing.audio_time);
                }
                else
                {
                    alert("Error: "+data.error);
                }
            },
            error: function (e) {
                console.log("error", e);
            }
        });
    }
}

function get_available_tracks()
{
    jQuery.ajax({
        type: "POST",
        url: "ajax.php?act=get_available_tracks",
        dataType:'json',
        data: {
        },
        success: function(data) {
            jQuery('#available_tracks').html('');
            jQuery.each(data['tracks'], function (k, v) {
                available_tracks[v['id']] = v;
                jQuery('#available_tracks').append(ich.available_track_template(v));
            });
        },
        error: function (e) {
            console.log("error", e);
        }
    });
}


function new_current()
{
    update_current_lock = 1;
    last_update_time = -10;
    jQuery.ajax({
        url: 'ajax.php?act=new_current',
        type:"POST",
        dataType:'json',
        data: {
            'audio_id': curr_playing['id']
        },
        error:function (e) {
            console.log('error', e);
            update_current_lock = 0;
        },
        success:function (data) {
            update_current_lock = 0;
        }
    });
}

function save_playlist()
{
    var playlist = [];
    jQuery('.playlist_td').each(function(){
        playlist.push(jQuery(this).attr('data-id'));
    });

    jQuery.ajax({
        url: 'ajax.php?act=save_playlist',
        type:"POST",
        dataType:'json',
        data: {
            'playlist': playlist.join('|')
        },
        error:function (e) {
            console.log('error', e);
        },
        success:function (data) {

        }
    });
}

function update_current()
{
    if (update_current_lock == 0 && Math.abs(last_update_time - curr_playing['current_playing_time']) >= 10)
    {
        update_current_lock = 1;
        last_update_time = curr_playing['current_playing_time'];
        jQuery.ajax({
            url: 'ajax.php?act=update_current',
            type:"POST",
            dataType:'json',
            data: {
                'audio_id': curr_playing['id'],
                'audio_time': curr_playing['current_playing_time']
            },
            error:function (e) {
                console.log('error', e);
                update_current_lock = 0;
            },
            success:function (data) {
                update_current_lock = 0;
            }
        });
    }
}

function end_current(duration)
{
    jQuery.ajax({
        url: 'ajax.php?act=end_current',
        type:"POST",
        dataType:'json',
        data: {
            'audio_id': curr_playing['id'],
            'duration': parseInt(duration)
        },
        error:function (e) {
            console.log('error', e);
        },
        success:function (data) {
            set_track_blank();
        }
    });
}

function add_to_playlist(title, mp3, id, author_name, track_timestamp)
{
    if (jQuery(".playlist_"+id).length <= 0)
    {
        var dataz = {
            'file_loc': mp3,
            'id': id,
            'author_name': author_name,
            'title': title,
            'track_timestamp': track_timestamp
        };
        jQuery('#playlist').append(ich.playlist_track(dataz));
        save_playlist();
    }
}

function remove_from_playlist(pid)
{
    jQuery(".playlist_"+pid).remove();
    save_playlist();
}


function play_track(info)
{
    update_current_lock = 1;
    set_current_track_local(info);
    new_current();
}
function resume_track(info, track_time)
{
    console.log("resuming track", info, track_time);
    set_current_track_local(info);
    if (track_time > 0)
        setTimeout("play_from_time("+track_time+")", 1000); //to bypass bug that occurs for html5 solution when calling play with time right after setmedia
}
function play_from_time(track_time)
{
    $("#jquery_jplayer_1").jPlayer("play", track_time);
}
function set_current_track_local(info)
{
    curr_playing = info;
    $("#jquery_jplayer_1").jPlayer("setMedia", {
        mp3: info.file_loc
    });
    jQuery('#curr_title').html(info.title);
    jQuery('#curr_author').html(info.author_name);
    jQuery('#curr_owner_name').html(info.owner_name);
    jQuery('#curr_owner_website').attr('src', info.owner_website);
    jQuery('#curr_description').html(info.description);
    jQuery('#curr_total_plays').html(info.plays);
    jQuery('#curr_track_timestamp').html(info.track_timestamp);
    jQuery('.curr_helper').css('display', 'inline');
}

function set_track_blank(info)
{
    curr_playing = {};
    $("#jquery_jplayer_1").jPlayer("setMedia", {
        mp3: ""
    });
    jQuery('#curr_title').html("None");
    jQuery('#curr_author').html("");
    jQuery('#curr_owner_name').html("");
    jQuery('#curr_owner_website').attr('src', "");
    jQuery('#curr_description').html("");
    jQuery('#curr_total_plays').html("");
    jQuery('#curr_track_timestamp').html('');
    jQuery('.curr_helper').css('display', 'none');
}

function next_track()
{
    if (jQuery('#playlist').find('tr:first-child').length > 0)
    {
        var load_track = available_tracks[jQuery('#playlist').find('tr:first-child').find('td:first-child').attr('data-id')];
        play_track(load_track);
        jQuery('#playlist').find('tr:first-child').remove();
        $("#jquery_jplayer_1").jPlayer("play");
    }
    save_playlist();
}