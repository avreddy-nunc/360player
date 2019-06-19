<?php
include_once($_SERVER["DOCUMENT_ROOT"]."/ava/php/common/engine.php");
$GLOBAL_ROOT_FOLDER = "/ava";
$EXTERIOR = 1;
$INTERIOR = 2;
$INTERIOR_PANO = 3;

class Player extends Engine
{
    function Init()
    {
        $this->Engine();
        $this->Setup();
    }

    function Run()
    {
        $this->m_run_type = $this->DecodeUrlStr("RUN_TYPE");

        if ($this->m_run_type == "ADD_HOT_SPOT_EXTERIOR")
            $this->AddHotSpotExterior();
        else if ($this->m_run_type == "ADD_HOT_SPOT_INTERIOR")
            $this->AddHotSpotInterior();
        else if ($this->m_run_type == "ADD_PANO_INTERIOR")
            $this->AddPanoInterior();
        else if ($this->m_run_type == "GET_HOT_SPOTS")
            $this->GetHotSpots();
        else if ($this->m_run_type == "SAVE_360_STATS_DETAILS")
            $this->Save360StatsDetails();
        else $this->PreviewVideo();
    }

    function NextPlayerType($video_id)
    {
        $NextPlayerType = "exterior";
        if($this->CheckPanoImageExists($video_id))
            $NextPlayerType = "interior-pano";
        elseif($this->CheckExteriorImages($video_id))
            $NextPlayerType = "interior";
        return $NextPlayerType;
    }

    function PreviewVideo()
    {
        global $GLOBAL_ROOT_FOLDER, $PLAYER_360_LOCAL_SPEEDS_SWIPE_THRESHOLD, $PLAYER_360_ROTATION;
        $video_fk = $this->DecodeClean("video_fk");
        $no_stats = $this->GetIntVal("no_stats");
        $sql_query = "SELECT video_id FROM ava_videos WHERE video_fk='{$video_fk}'";
        $video_id = $this->GenerateSingleValue($sql_query, "video_id");
        $imagesCount = $this->GenerateSingleValue("SELECT count(*) as total FROM `ava_images_360` WHERE ai_image_type > 0 AND ai_video_id={$video_id}","total");
        $trackId = 0;
        if (!$no_stats)
            $trackId = $this->Save360Stats($video_id);

        if (!$video_id)
            echo "Invalid video key";
        else if (!$imagesCount)
            echo "No 360 player images are available.";
        else
        {
            $video_title = $this->GetVideoTitle($video_id);
            $base_width_height = $this->GetBaseWidthHeight($video_id);
            $SwipeThreshold = $PLAYER_360_LOCAL_SPEEDS_SWIPE_THRESHOLD;//Player Width Percentage one drag will spin images once
            $PlayerRotation= $PLAYER_360_ROTATION;//Player Rotation, 0 = Regular, 1 = Reverse;
            $TotalImages = $this->GetPlayerImagesCount($video_id);
            $NextPlayerType = $this->NextPlayerType($video_id);
            $playerType = $this->DecodeClean("playerType", "exterior");
            $playerRuntype = ($playerType == "interior") ? "ADD_HOT_SPOT_INTERIOR" : "ADD_HOT_SPOT_EXTERIOR";
            $playerJsonUrl = "?RUN_TYPE={$playerRuntype}&videoId={$video_id}&type={$playerType}&all=true&player=true&dataType=json&time=".time();
            $firstImage = $this->GetPlayerFirstImage($video_id);

            $template = file_get_contents("360playerV4/360_player_v2.html");
            $template = str_replace("<!--PLAYER_JSON_URL-->", $playerJsonUrl, $template);
            $template = str_replace("<!--FIRST_360_IMAGE-->", $firstImage, $template);
            $template = str_replace("<!--VIDEO_ID-->", $video_id, $template);
            $template = str_replace("<!--TRACK_ID-->", $trackId, $template);
            $template = str_replace("<!--BASE_WIDTH-->", $base_width_height['width'], $template);
            $template = str_replace("<!--BASE_HEIGHT-->", $base_width_height['height'], $template);
            $template = str_replace("<!--VIDEO_FK-->", $video_fk, $template);
            $template = str_replace("<!--VIDEO_TITLE-->", $video_title, $template);
            $template = str_replace("<!--SWIPE_THRESHOLD-->", $SwipeThreshold, $template);
            $template = str_replace("<!--PLAYER_ROTATION-->", $PlayerRotation, $template);
            $template = str_replace("<!--NEXT_PLAYER_TYPE-->", $NextPlayerType, $template);
            $template = str_replace("<!--TOTAL_IMAGES-->", $TotalImages, $template);
            $template = str_replace("<!--ROOT_PATH-->", $GLOBAL_ROOT_FOLDER, $template);
            echo $template;
        }
    }

    function GetBaseWidthHeight($video_id)
    {
        $playerType = $this->DecodeClean("playerType");
        $where_condition = ($playerType == 'interior') ? "and avei_img_interior=1" : "and avei_img_exterior=1";
        $width_height = array("width" => 0, "height" => 0);
        $sqlQuery = "select avei_img_width as width, avei_img_height as height from ava_videos_ex_images WHERE avei_video_id=$video_id {$where_condition} ";
        $image_width_height = $this->GenerateSingleRow($sqlQuery);
        if(!empty($image_width_height['width']))
            $width_height = $image_width_height;
        return $width_height;
    }

    function CheckExteriorImages($videoId)
    {
        $checkInterior = "SELECT count(*) as total FROM `ava_images_360` WHERE ai_video_id={$videoId} AND ai_image_type ='2'";
        $total = $this->GenerateSingleValue($checkInterior, 'total');
        return $total;
    }

    function BuildJsonArray($player, $videoId, $ai_image_type = 1, $ext_int = 'exterior')
    {
        $hotspots = [];
        $allCars['allCars'] = [];

        $hotspotSqlQuery = "SELECT ai.ai_id,ahs.ahs_spot_name as spotName,ahs.ahs_feature_name as featureName,ain.ain_icon_name as iconName, ahs.ahs_image_url, aih.aih_left_position, aih.aih_top_position, ahs.ahs_id FROM `ava_images_360` ai, ava_image_hotspot aih, ava_hot_spot ahs LEFT JOIN ava_icon_names ain ON (ain.ain_id = ahs.ahs_icon_id) WHERE ai.ai_video_id={$videoId} AND ai.ai_image_type ='{$ai_image_type}' and aih.aih_ai_id = ai.ai_id and aih.aih_ahs_id = ahs.ahs_id ORDER BY ai_sort_order";
        $this->SelectQuery($hotspotSqlQuery);
        $hotspotArray = $this->m_data_rows;
        if (!empty($hotspotArray))
        {
            foreach ($hotspotArray as $hotspot)
            {
                $hotspots[$hotspot['ai_id']][] = ['featureName' => $hotspot['featureName'],'iconName' => $hotspot['iconName'],'spotName' => $hotspot['spotName'],'top' => $hotspot['aih_top_position'],'left' => $hotspot['aih_left_position'],'mainId' => $hotspot['ahs_id']];
            }
        }

        $interiorSqlQuery = "SELECT ai_image_url, if(avei_img_orig_width, replace(ai_image_url, concat(video_fk,'_'), CONCAT(avei_img_orig_width,'/',video_fk,'_')), '') higresurl, ai_id, '{$ext_int}' AS ai_image_type,avei_img_orig_width FROM `ava_images_360`,ava_videos_ex_images,ava_videos WHERE video_id=avei_video_id AND ai_video_id=avei_video_id AND ai_video_id={$videoId} AND ai_image_type ='{$ai_image_type}' ORDER BY ai_sort_order";
        $this->SelectQuery($interiorSqlQuery);
        if ($this->m_row_count)
        {
            $i = 0;
            foreach ($this->m_data_rows as $row)
            {
                $img_hotspots = empty($hotspots[$row['ai_id']]) ? [] : @$hotspots[$row['ai_id']];
                $inc_id = ($player) ? $i : $row['ai_id'];
                $allCars['allCars'][] = ['src' => $row['ai_image_url'], 'highResSrc' => $row['higresurl'], 'id' => $inc_id, 'imageId' => $row['ai_id'], 'imgType' => $row['ai_image_type'], 'hotSpot' => $img_hotspots];

                $i++;
            }
        }

        return $allCars;
    }

    function AddHotSpotExterior()
    {
        $videoId = $this->GetIntVal("videoId");
        $data_type = $this->DecodeClean("dataType");
        $player = $this->DecodeClean("player");

        $allCars = $this->BuildJsonArray($player, $videoId, 1, 'exterior');
        echo json_encode($allCars);
        exit;
    }

    function AddHotSpotInterior()
    {
        $videoId = $this->GetIntVal("videoId");
        $data_type = $this->DecodeClean("dataType");
        $player = $this->DecodeClean("player");

        $allCars = $this->BuildJsonArray($player, $videoId, 2, 'interior');
        echo json_encode($allCars);
        exit;
    }

    function GetHotSpots()
    {
        $videoId = intval($this->DecodeClean("videoId"));
        $type = $this->GetPlayerType($this->DecodeClean("type"));
        $player = $this->DecodeClean("player");
        $all = $this->DecodeClean("all");
        $cond = '';

        $hotspots['allFeatures'] = [];
        if ($all == 'true')
            $cond = " AND ahs_id IN(SELECT aih_ahs_id FROM ava_image_hotspot where aih_ai_id in (SELECT ai_id FROM ava_images_360 where ai_image_type = '{$type}' and ai_video_id = $videoId))";
        $hotspotSqlQuery = "SELECT ahs.ahs_spot_name as spotName, ahs.ahs_id as id, ahs.ahs_feature_name as featureName, ain.ain_icon_name as iconName, ahs.ahs_image_url as src, ahs.ahs_feature_description as description FROM `ava_hot_spot` ahs LEFT JOIN ava_icon_names ain ON (ain.ain_id = ahs.ahs_icon_id) WHERE ahs.ahs_video_id={$videoId} AND ahs.ahs_type ='{$type}' $cond";
        $this->SelectQuery($hotspotSqlQuery);
        $i = 0;
        if ($this->m_row_count)
        {
            foreach ($this->m_data_rows as $data)
            {
                $sort_order = $i;
                $hotspots['allFeatures'][] = ["spotName" => $data['spotName'], "featureName" => $data['featureName'], "iconName" => $data['iconName'], "src" => $data['src'], "description" => $data['description'], "id" => $data['id'], "frameImgId" => $sort_order, "forder" => $i, ];
                $i++;
            }
        }
        echo json_encode($hotspots);
        exit;
    }

    function GetVideoTitle($videoId)
    {
        $getVideoTitle = "SELECT video_title FROM ava_videos WHERE video_id={$videoId}";
        $video_title = $this->GenerateSingleValue($getVideoTitle, 'video_title');
        return $video_title;
    }

    function Save360Stats($video_id)
    {
        $sql_query = "SELECT video_client_id FROM ava_videos WHERE video_id='{$video_id}'";
        $client_id = $this->GenerateSingleValue($sql_query, "video_client_id");
        $remote_ip = $_SERVER['REMOTE_ADDR'];
        $host = @$_SERVER['REMOTE_HOST'];
        $playerType = $this->DecodeClean("playerType");
        $playerType = $this->GetPlayerType($playerType);

        $store_vals = array('OS', 'REMOTE_HOST', 'REMOTE_ADDR', 'HTTPS', 'HTTP_USER_AGENT', 'HTTP_HOST');
        $user_agent = '';
        foreach ($_SERVER as $server_key => $server_val)
        {
            if (in_array($server_key, $store_vals))
                $user_agent .= $server_key."::".$server_val."||";
        }

        $domain = (@$_SERVER['HTTP_REFERER']) ? @$_SERVER['HTTP_REFERER'] : @$_SERVER['HTTP_HOST'];
        $domain = str_replace('"', "\"", $domain);
        $user_agent = str_replace('"', "\"", $user_agent);

        $insertQuery = "INSERT INTO ava_360_stats (stat_video_id, stat_client_id, stat_remote_ip, stat_remote_domain, stat_player_type, stat_referrer_url, stat_user_agent) VALUES ($video_id, $client_id, '{$remote_ip}', '{$host}', '{$playerType}', '{$domain}', '{$user_agent}')";
        return $trackId = $this->ExecuteQuery($insertQuery);
    }

    function Save360StatsDetails()
    {
        $trackID = intval($this->DecodeClean("trackID"));
        $spins = intval($this->DecodeClean("spins"));
        $hid = intval($this->DecodeClean("hid"));
        $source = intval($this->DecodeClean("source"));
        $percentCompleted = intval(round($this->DecodeClean("percentCompleted")));
        $timeCount = intval($this->DecodeClean("count"));
        $timestamp_start = $this->DecodeClean("timeStart");
        $timestamp_end = $this->DecodeClean("timeEnd");
        $imageId = $this->DecodeClean("imageId");
        $imageStartTime = $this->DecodeClean("imageStartTime");
        $imageEndTime = $this->DecodeClean("imageEndTime");
        $imageType = $this->DecodeClean("imageType");
        $playerType = $this->GetPlayerType($imageType);

        $update_columns = [];
        if (!empty($spins))
            $update_columns[] = "stat_spins=(stat_spins+1)";
        if (!empty($timeCount))
            $update_columns[] = "stat_time_count=({$timeCount}*5)";
        if (!empty($percentCompleted))
            $update_columns[] = "stat_percentage={$percentCompleted}";

        if($update_columns && $trackID)
        {
            $update_columns = implode(",", $update_columns);
            $this->ExecuteQuery("UPDATE ava_360_stats SET $update_columns WHERE stat_id = {$trackID}");
        }

        if (!empty($hid) && !empty($trackID))
        {
            $insertQuery = "INSERT INTO ava_360_stats_details (sd_stat_id, sd_hid, sd_source, sd_time_start, sd_time_end) VALUES ($trackID, $hid, $source, '$timestamp_start', '$timestamp_end')";
            $this->ExecuteQuery($insertQuery);
        }
	
	    if (!empty($imageId) && !empty($trackID))
        {
            $insertQuery = "INSERT INTO ava_360_image_stats_details (isd_stat_id, isd_image_id, isd_image_type, isd_time_start, isd_time_end) VALUES ($trackID, $imageId, $playerType, '$imageStartTime', '$imageEndTime')";
            $this->ExecuteQuery($insertQuery);
        }
	    
        echo "success";
    }

    function AddPanoInterior()
    {
        $videoId = $this->GetIntVal("videoId");
        $data_type = $this->DecodeClean("dataType");

        $panoSqlQuery = "SELECT avpi_pano_url AS 'panourl', avpi_id AS 'panoid' FROM ava_videos_ex_images aei, ava_videos av ,ava_videos_pano_images avpi WHERE avpi.avpi_video_id = av.video_id AND avei_video_id = av.video_id AND av.video_id = {$videoId} AND av.video_delete_flag = 0";
        $pano_row = $this->GenerateSingleRow($panoSqlQuery);
        $exterior_json = [];
        if (!empty($pano_row))
        {
            $exterior_json['data'] = ["pano_image" => $pano_row['panourl'], "pano_id" => $pano_row['panoid'], "caption" => "", "markers" => []];
            $markerSqlQuery = "SELECT * FROM ava_pano_hotspot aph LEFT JOIN ava_icon_names ain ON (ain.ain_id = aph.aph_icon_id) WHERE aph.aph_pi_id = ".$pano_row['panoid']." AND aph.aph_active = 1";
            $this->SelectQuery($markerSqlQuery);
            $markerArray = $this->m_data_rows;
            if (!empty($markerArray))
            {
                foreach ($markerArray as $marker)
                {
                    $exterior_json['data']['markers'][] = ["id" => $marker['aph_id'], "longitude" => $marker['aph_longitude'], "latitude" => $marker['aph_latitude'], "image" => $marker['ain_icon_src'], "imageid" => $marker['ain_id'], "anchor" => "top center", "tooltip" => $marker['aph_title'], "data" => ["thumbnail" => $marker['aph_marker_thumb'], "description" => $marker['aph_desc']]];
                }
            }
        }
        echo json_encode($exterior_json);
        exit;
    }

    function CheckPanoImageExists($videoId)
    {
        $panoExists = 0;
        $sqlQuery = "SELECT avpi_pano_url FROM ava_videos_pano_images,ava_videos_ex_images WHERE avei_video_id=avpi_video_id AND avpi_video_id = ".$videoId;
        $avpi_pano_url = $this->GenerateSingleValue($sqlQuery, "avpi_pano_url");
        if (!empty($avpi_pano_url))
        {
            if ($this->CheckImageExistsURL($avpi_pano_url))
                $panoExists = $avpi_pano_url;
        }
        return $panoExists;
    }

    function CheckImageExistsURL($url)
    {
        $ret_val = 0;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_NOBODY, true); // this is what sets it as HEAD request
        curl_setopt($ch, CURLOPT_TIMEOUT, 2);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_exec($ch);

        if (curl_getinfo($ch, CURLINFO_HTTP_CODE) == '200')
            $ret_val = 1;

        curl_close($ch);

        return $ret_val;
    }

    function GetPlayerType($playerType)
    {
        global $EXTERIOR, $INTERIOR, $INTERIOR_PANO;
        $ext_int_playerType = ($playerType == 'interior') ? $INTERIOR : $EXTERIOR;
        $playerType = ($playerType == 'interior-pano') ? $INTERIOR_PANO : $ext_int_playerType;
        return $playerType;
    }

    function GetPlayerImagesCount($videoId)
    {
        $imageType = $this->DecodeClean("playerType");
        $playerType = ($imageType == 'interior') ? 2 : 1;
        $checkInterior = "SELECT count(*) as total FROM `ava_images_360` WHERE ai_video_id={$videoId} AND ai_image_type ={$playerType}";
        return $total = $this->GenerateSingleValue($checkInterior, 'total');
    }

    function GetPlayerFirstImage($videoId)
    {
        $imageType = $this->DecodeClean("playerType");
        $playerType = ($imageType == 'interior') ? 2 : 1;
        $ImgUrlQuery = "SELECT ai_image_url FROM `ava_images_360` WHERE ai_video_id={$videoId} AND ai_image_type ={$playerType} order by ai_sort_order,ai_id LIMIT 1";
        return $this->GenerateSingleValue($ImgUrlQuery, 'ai_image_url');
    }
}
