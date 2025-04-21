import json
import os
import base64
import logging
import urllib.parse
import boto3
from urllib.parse import unquote_plus
import requests

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS services
s3 = boto3.client('s3')

def lambda_handler(event, context):
    # Set up CORS headers
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    }
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'CORS preflight request successful'})
        }
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Extract parameters
        doodle_image = body.get('doodleImage')
        mode = body.get('mode')
        style = body.get('style', 'cartoon')
        prompt = body.get('prompt')
        max_tokens = body.get('max_tokens', 300)
        
        # Get OpenAI API key from environment variable
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        if not openai_api_key:
            logger.error("OpenAI API key not configured")
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({
                    'error': 'OpenAI API key not configured'
                })
            }
        
        # Process based on mode
        if mode == "text":
            # Process text generation for puzzles
            logger.info(f"Generating text response for prompt: {prompt}")
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openai_api_key}"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a friendly, educational assistant for children. Provide engaging, age-appropriate responses that are informative but simple to understand. Include fun facts when relevant."
                        },
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": max_tokens
                }
            )
            
            text_data = response.json()
            
            if 'error' in text_data:
                logger.error(f"OpenAI text generation error: {text_data['error']}")
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({
                        'error': 'Failed to generate text response',
                        'details': text_data.get('error')
                    })
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'response': text_data['choices'][0]['message']['content']
                })
            }
            
        elif mode == "image":
            # Validate doodle image for image generation
            if not doodle_image:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({
                        'error': 'No doodle image provided'
                    })
                }
            
            # Style-specific prompt modifications
            style_prompt = ""
            if style == "cartoon":
                style_prompt = "in a colorful cartoon style with bold outlines and vibrant colors"
            elif style == "watercolor":
                style_prompt = "in a soft watercolor style with gentle brushstrokes and blended colors"
            elif style == "pixel":
                style_prompt = "as pixel art, with clear blocky pixels and limited color palette"
            elif style == "storybook":
                style_prompt = "as a children's storybook illustration with whimsical details and soft colors"
            elif style == "sketchy":
                style_prompt = "as a refined pencil sketch with detailed shading and texture"
            else:
                style_prompt = "in a colorful cartoon style with bold outlines and vibrant colors"
            
            # Generate styled image using the actual doodle as input
            # First, use GPT-4 Vision to understand what the doodle is showing
            logger.info("Analyzing doodle image...")
            
            vision_response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openai_api_key}"
                },
                json={
                    "model": "gpt-4o",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an assistant that analyzes children's drawings and provides detailed descriptions of what they depict."
                        },
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Analyze this child's drawing and describe what you see in detail."
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": doodle_image
                                    }
                                }
                            ]
                        }
                    ],
                    "max_tokens": 300
                }
            )
            
            vision_data = vision_response.json()
            
            if 'error' in vision_data:
                logger.error(f"OpenAI vision analysis error: {vision_data['error']}")
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({
                        'error': 'Failed to analyze doodle',
                        'details': vision_data.get('error')
                    })
                }
            
            doodle_description = vision_data['choices'][0]['message']['content']
            logger.info(f"Doodle description: {doodle_description}")
            
            # Now use this description to generate a new image with DALL-E
            image_prompt = f"Create a high-quality image {style_prompt} based exactly on this child's drawing. The drawing shows: \"{doodle_description}\". Maintain the key elements, proportions, and character of the child's original drawing but enhance it visually."
            
            logger.info(f"Generating image with prompt: {image_prompt}")
            
            image_response = requests.post(
                "https://api.openai.com/v1/images/generations",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openai_api_key}"
                },
                json={
                    "model": "dall-e-3",
                    "prompt": image_prompt,
                    "n": 1,
                    "size": "1024x1024",
                }
            )
            
            image_data = image_response.json()
            
            if 'error' in image_data:
                logger.error(f"OpenAI image generation error: {image_data['error']}")
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({
                        'error': 'Failed to generate image',
                        'details': image_data.get('error')
                    })
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'imageUrl': image_data['data'][0]['url'],
                    'description': doodle_description  # Return the description so we can show it to the user
                })
            }
            
        elif mode == "video":
            # Validate doodle image for video generation
            if not doodle_image:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({
                        'error': 'No doodle image provided'
                    })
                }
            
            description = ""
            
            # If we don't have a description yet, analyze the doodle using Vision API
            if not prompt:
                try:
                    logger.info("Analyzing doodle image for video...")
                    
                    vision_response = requests.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {openai_api_key}"
                        },
                        json={
                            "model": "gpt-4o",
                            "messages": [
                                {
                                    "role": "system",
                                    "content": "You are an assistant that analyzes children's drawings and provides detailed descriptions of what they depict."
                                },
                                {
                                    "role": "user",
                                    "content": [
                                        {
                                            "type": "text",
                                            "text": "Analyze this child's drawing and describe what you see in detail."
                                        },
                                        {
                                            "type": "image_url",
                                            "image_url": {
                                                "url": doodle_image
                                            }
                                        }
                                    ]
                                }
                            ],
                            "max_tokens": 300
                        }
                    )
                    
                    vision_data = vision_response.json()
                    
                    if 'error' in vision_data:
                        logger.error(f"OpenAI vision analysis error: {vision_data['error']}")
                        raise Exception("Failed to analyze doodle")
                    
                    description = vision_data['choices'][0]['message']['content']
                    logger.info(f"Doodle analysis for video: {description}")
                except Exception as e:
                    logger.error(f"Error analyzing doodle: {str(e)}")
                    # Fall back to using just the name if analysis fails
            else:
                description = prompt  # Use the provided description if available
            
            # Use OpenAI to create a short description and then generate a video
            video_prompt = description if description else "Create a short description for a lively, animated 8-second video about this drawing. The video should be engaging for children. Focus on movements and actions."
            if description:
                video_prompt = f"Create a short description for a lively, animated 8-second video about this drawing: {description}. The video should be engaging for children. Focus on movements and actions."
            
            logger.info(f"Generating video description with prompt: {video_prompt}")
            
            description_response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openai_api_key}"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "You are a creative assistant that writes short video descriptions for children's content."},
                        {"role": "user", "content": video_prompt}
                    ]
                }
            )
            
            desc_data = description_response.json()
            if 'error' in desc_data:
                logger.error(f"OpenAI description generation error: {desc_data['error']}")
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({
                        'error': 'Failed to generate video description',
                        'details': desc_data.get('error')
                    })
                }
            
            video_description = desc_data['choices'][0]['message']['content']
            logger.info(f"Generated video description: {video_description}")
            
            # Now use the description to generate a video representation
            try:
                # Generate a video representation using DALL-E 3 image as a base
                video_gen_prompt = f"Create a fun, animated video for children. {video_description}"
                
                # For now, since direct video generation API is not available, provide
                # an enhanced image with movement suggestion
                video_image_response = requests.post(
                    "https://api.openai.com/v1/images/generations",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {openai_api_key}"
                    },
                    json={
                        "model": "dall-e-3",
                        "prompt": f"Create a single frame from an animated video that captures movement and action: {video_gen_prompt}. Make it dynamic and visually suggest motion.",
                        "n": 1,
                        "size": "1024x1024",
                    }
                )
                
                video_image_data = video_image_response.json()
                
                if 'error' in video_image_data:
                    raise Exception(f"Video image generation failed: {json.dumps(video_image_data.get('error'))}")
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'videoUrl': video_image_data['data'][0]['url'],
                        'description': video_description,
                        'message': "Video visualization created. Actual video animation would require additional services."
                    })
                }
            except Exception as e:
                logger.error(f"Video generation error: {str(e)}")
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({
                        'error': 'Failed to generate video',
                        'details': str(e),
                        'fallbackDescription': video_description
                    })
                }
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': "Invalid mode. Use 'image', 'video', or 'text'"
                })
            }
    except Exception as e:
        logger.error(f"Error in generate-media function: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'An unexpected error occurred',
                'details': str(e)
            })
        } 