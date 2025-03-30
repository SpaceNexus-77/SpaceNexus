import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Postcard.module.css'

export default function Postcard() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // This should be the actual API call, now just simulating
      console.log('Submitting postcard data:', formData);
      
      // Simulating API request delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitResult({
        success: true,
        message: 'Your space postcard has been successfully submitted! We will contact you before launch to confirm details.'
      });
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        content: '',
        image: null
      });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitResult({
        success: false,
        message: 'Submission failed, please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Space Postcards - SpaceNexus</title>
        <meta name="description" content="Send your postcards to space and back to Earth" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Space Postcards</h1>
        <p className={styles.description}>
          Your message will be sent to space and returned to Earth as a physical postcard with a "Space Traveled" stamp
        </p>

        <div className={styles.postcardContainer}>
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="content">Postcard Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your message, dreams, or visions for the future that you want to send to space..."
                  maxLength={500}
                  required
                />
                <small>{formData.content.length}/500 characters</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="image">Upload Image (Optional)</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Postcard'}
              </button>
            </form>
          </div>

          <div className={styles.postcardPreview}>
            <h3>Postcard Preview</h3>
            <div className={styles.postcardCard}>
              <div className={styles.postcardImage}>
                {formData.image ? (
                  <img src={URL.createObjectURL(formData.image)} alt="Preview" />
                ) : (
                  <div className={styles.noImage}>Please upload an image</div>
                )}
              </div>
              <div className={styles.postcardContent}>
                <p>{formData.content || 'Enter your postcard content here...'}</p>
                <div className={styles.postcardSignature}>
                  <p>{formData.name || 'Your signature'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {submitResult && (
          <div className={`${styles.resultMessage} ${submitResult.success ? styles.success : styles.error}`}>
            {submitResult.message}
          </div>
        )}

        <div className={styles.infoSection}>
          <h2>Space Postcard Project Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>Launch Date</h3>
              <p>Expected Q3 2025</p>
            </div>
            <div className={styles.infoCard}>
              <h3>Partner</h3>
              <p>SpaceX Falcon 9 Rocket</p>
            </div>
            <div className={styles.infoCard}>
              <h3>Return to Earth</h3>
              <p>Postcards will return to Earth with a special space stamp</p>
            </div>
            <div className={styles.infoCard}>
              <h3>NFT Creation</h3>
              <p>Each postcard will generate a unique digital NFT memento</p>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>SpaceNexus &copy; {new Date().getFullYear()} - Science Without Boundaries, Exploring the Universe</p>
      </footer>
    </div>
  )
} 