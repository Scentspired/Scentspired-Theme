/* Adds Judge.me's reviews to the product's structured data (script#product-schema-<product id>), once Judge.me has loaded them. Moved from layout/theme.liquid. */
        (function () {

        function addJudgeMeReviews() {

          if (
            typeof jdgm === "undefined" ||
            !jdgm.data ||
            !jdgm.data.reviewWidget
          ) {
            setTimeout(addJudgeMeReviews, 500);
            return;
          }

          var scriptTag = document.querySelector('script[type="application/ld+json"][id^="product-schema-"]');
          if (!scriptTag) return;
          var productId = scriptTag.id.replace('product-schema-', '');
          var jdgmProduct = jdgm.data.reviewWidget[productId];

          if (
            !jdgmProduct ||
            !jdgmProduct.reviews ||
            !jdgmProduct.reviews.length
          ) {
            return;
          }

          var reviews = jdgmProduct.reviews.map(function(review){
            return {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": review.reviewer_name
              },
              "datePublished": review.created_at,
              "reviewBody": review.body,
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating,
                "bestRating": "5",
                "worstRating": "1"
              }
            };
          });


          try {
            var productSchema = JSON.parse(scriptTag.textContent);
            productSchema.review = reviews;
            scriptTag.textContent = JSON.stringify(productSchema);
          } catch (e) {
            console.error("Failed to merge Judge.me reviews into Product schema:", e);
          }
        }

        addJudgeMeReviews();

        })();
      
