import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER } from '../utils/queries';
import { ADD_IMAGE, REMOVE_IMAGE } from '../utils/mutations';
import Auth from '../utils/auth';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {
    Container,
    Col,
    Form,
    Button,
    Card,
    Row
  } from 'react-bootstrap';
import { searchImages } from '../utils/API'



// will need to edit this when unsplash is implemented
const VisionBoard = () => {
    const [imageData, setImageData] = useState({ imageLink: '' });
    const { data } = useQuery(GET_USER);
    const [searchInput, setSearchInput] = useState('');
    const [searchedImages, setSearchedImages] = useState([]);
    const [addImage] = useMutation(ADD_IMAGE);
    const [removeImage] = useMutation(REMOVE_IMAGE);
    const [image, setImage] = useState(null);

    const visionBoardData = data?.user || [];

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setImageData({ ...imageData, [name]: value });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
    
        if (!searchInput) {
          return false;
        }
    
        try {
          const response = await searchImages(searchInput);
    
          if (!response.ok) {
            throw new Error('something went wrong!');
          }

          const { photos } = await response.json();
    
          const imageData = photos.results.map((images) => ({
            description: images.alt_description,
            imageLink: images.urls.regular
          }));
    
          setSearchedImages(imageData);
          setSearchInput('');
        } catch (err) {
          console.error(err);
        }
      };

    const handleAddImage = async (imageLink) => {
      
        const saveImage = searchedImages.find((image) => image.imageLink === imageLink);
        const token = Auth.loggedIn() ? Auth.getToken() : null;

        if (!token) {
            return false;
        }

        try {
            await addImage({
              variables: { input: { imageLink: saveImage.imageLink } }
            });
            setImage(saveImage);
        } catch (err) {
            console.error(err);
        }
    }

    const handleRemoveImage = async (imageID) => {
        const token = Auth.loggedIn() ? Auth.getToken() : null;

        if (!token) {
            return false;
        }

        try { 
            await removeImage({
                variables: { imageID }
            });
        } catch (err) {
            console.error(err);
        }
    }

    // array for images



    // function for moving image

    const moveImage = useCallback((dragIndex, hoverIndex) => {
        setImages((prevImages) =>
            update(prevImages, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevImages[dragIndex]],
                ],
            }),
        ) 
    }, [])
    return (
    <DndProvider backend={HTML5Backend}>
      <div>
          <h1 className='text-center m-5'>Search for an Image to add to your Vision Board</h1>
          <Form className='mx-5' onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for an Image'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg' className='btn btn-dark mx-5 my-2 px-4'>
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
      </div>

      <Container>
        <Row>
          {searchedImages.map((images) => {
            return (
              <Col md="4">
                <Card key={images.description} border='dark'>
                  {images.description ? (
                    <Card.Img src={images.imageLink} alt={`${images.description}`} variant='top' />
                  ) : null}
                      <Button
                        disabled={image?.imageLink === images.imageLink}
                        className='btn btn-dark mx-5 my-2 px-4'
                        onClick={() => handleAddImage(images.imageLink)}>
                        {image?.imageLink === images.imageLink
                          ? 'Image added'
                          : 'Add image to your Vision Board'}
                      </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
      <Container>
        <Row>
          {visionBoardData.images.map((images) => {
            return (
              <Col md="4">
                <Card key={images.imageLink} border='dark'>
                  {images.imageLink ? (
                    <Card.Img src={images.imageLink} alt={`${images.description}`} variant='top' />
                  ) : null}
                      <Button
                        className='btn btn-dark mx-5 my-2 px-4'
                        onClick={() => handleRemoveImage(images.imageID)}>
                        Remove image
                      </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </DndProvider>)
}

export default VisionBoard;