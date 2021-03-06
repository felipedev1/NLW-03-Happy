import React, { ChangeEvent, FormEvent, useState } from "react";
import { useHistory } from "react-router-dom";
import { Map, Marker, TileLayer } from 'react-leaflet';
import { LeafletMouseEvent } from "leaflet";
import InputMask from 'react-input-mask'

import { FiPlus, FiX } from "react-icons/fi";

import '../styles/pages/create-orphanage.css';
import Sidebar from "../components/Sidebar";
import mapIcon from "../utils/mapIcon";
import api from "../services/api";

interface ImagesPreviewModel {
  blob: string;
  image: File;
}

export default function CreateOrphanage() {
  const history = useHistory()

  const [position, setPosition] = useState({latitude: 0, longitude: 0})
  const [name, setName] = useState('')
  const [about, setAbout] = useState('')
  const [instructions, setInstructions] = useState('')
  const [opening_hours, setOpeningHours] = useState('')
  const [open_on_weekends, setOpenOnWeekends] = useState(true)
  const [whatsapp, setWhatsapp] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagesPreview, setImagesPreview] = useState<ImagesPreviewModel[]>([])

  function handleMapClick(event: LeafletMouseEvent) {

    const { lat, lng} = event.latlng

    setPosition({
      latitude: lat,
      longitude: lng
    })
  }

  function handleSelectImages(event: ChangeEvent<HTMLInputElement>) {
    if(!event.target.files) {
      return;
    }

    const selectedImages = Array.from(event.target.files)

    setImages(prev => [...prev, ...selectedImages]); 

    const selectedImagesPreview = selectedImages.map(image => {
      return {
        blob: URL.createObjectURL(image),
        image: image
      }
    })

    setImagesPreview(prev => [...prev, ...selectedImagesPreview])
  }

  function handleDropImagePreview(imageDroped: ImagesPreviewModel) {
    const newPreviewImages = imagesPreview.filter(imagePreview => {
      return imagePreview.blob !== imageDroped.blob
    })

    setImagesPreview(newPreviewImages)

    const newImages = images.filter(image => {
  
      return image != imageDroped.image
    })

    setImages(newImages)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const { latitude, longitude } = position

    const noFormatWhatsapp = whatsapp.replace(/\s/g, "").replace("(", "").replace(")", "")

    const data = new FormData()

    data.append('name', name)
    data.append('about', about)
    data.append('latitude', String(latitude))
    data.append('longitude', String(longitude))
    data.append('instructions', instructions)
    data.append('opening_hours', opening_hours)
    data.append('open_on_weekends', String(open_on_weekends))
    data.append('whatsapp', String(noFormatWhatsapp))
    images.forEach(image => {
      data.append('images', image)
    })

    await api.post('orphanages', data)

    alert('Orfanato cadastrado com sucesso!')

    history.push('/app')
  }

  return (
    <div id="page-create-orphanage">
      <Sidebar />

      <main>
        <form onSubmit={handleSubmit} className="create-orphanage-form">
          <fieldset>
            <legend>Dados</legend>

            <Map 
              center={[-27.2092052,-49.6401092]} 
              style={{ width: '100%', height: 280 }}
              zoom={15}
              onclick={handleMapClick}
            >
              <TileLayer 
                url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              { position.latitude !== 0 && (
                <Marker 
                  interactive={false} 
                  icon={mapIcon} 
                  position={[position.latitude, position.longitude]} 
                />
              )}
              
            </Map>

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>

            <div className="input-block">
              <label htmlFor="about">Sobre <span>Máximo de 300 caracteres</span></label>
              <textarea 
                id="name" 
                maxLength={300}
                value={about} 
                onChange={(e) => setAbout(e.target.value)} 
              />
            </div>

            <div className="input-block">
              <label htmlFor="whatsapp">Número de Whatsapp</label>
              <InputMask
                mask="+99 (99) 9 9999 9999"
                maskChar={null}
                id="whatsapp" 
                value={whatsapp} 
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="images">Fotos</label>

              <div className="images-container">
                {imagesPreview.map(image => {
                  return (
                    <div key={image.blob} className="image-block">
                      <img src={image.blob} alt={name} />
                      <button className="drop-image" onClick={() => handleDropImagePreview(image)} >
                        <FiX color="#FF669D" size={24} />
                      </button>
                    </div>
                  )
                })}

                <label htmlFor="image[]" className="new-image">
                  <FiPlus size={24} color="#15b6d6" />
                </label>
              </div>

              <input multiple
                onChange={handleSelectImages} 
                type="file" 
                id="image[]" 
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Visitação</legend>

            <div className="input-block">
              <label htmlFor="instructions">Instruções</label>
              <textarea 
                id="instructions" 
                value={instructions} 
                onChange={(e) => setInstructions(e.target.value)} 
              />
            </div>

            <div className="input-block">
              <label htmlFor="opening_hours">Horário de funcionamento</label>
              <input 
                id="opening_hours" 
                value={opening_hours} 
                onChange={(e) => setOpeningHours(e.target.value)} 
              />
            </div>

            <div className="input-block">
              <label htmlFor="open_on_weekends">Atende fim de semana</label>

              <div className="button-select">
                <button 
                  type="button" 
                  className={open_on_weekends ? 'active' : ''}
                  onClick={() => setOpenOnWeekends(true)}
                >
                  Sim
                </button>
                <button 
                  type="button"
                  className={!open_on_weekends ? 'active' : ''}
                  onClick={() => setOpenOnWeekends(false)}
                >
                  Não
                </button>
              </div>
            </div>
          </fieldset>

          <button className="confirm-button" type="submit">
            Confirmar
          </button>
        </form>
      </main>
    </div>
  );
}

// return `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`;
